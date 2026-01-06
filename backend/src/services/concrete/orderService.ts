import { FilterQuery, Model } from 'mongoose';
import { MongooseCommonService } from './mongooseCommonService';
import { OrderModel, SkuModel, ProductModel, UserModel } from '../../db/mongodb';
import { IOrder, TOrderCreateReq } from '../../types/order';
import { CouponService } from './couponService';
import { inventoryAuditService } from './inventoryAuditService';
import { logisticsService } from './logisticsService';
import { LoyaltyService } from './loyaltyService';
import { pulseService } from './pulseService';
import { COUPON_TYPE } from '../../constants/coupon';
import { LOYALTY_TRANSACTION_TYPE, LOYALTY_CONFIG } from '../../constants/loyalty';
import { rtoScoreService } from './rtoScoreService';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import mongoose from 'mongoose';

import { IOrderService } from '../contracts/orderServiceInterface';

import { IOrderDocument } from '../../db/mongodb/models/orderModel';
import { logisticsNotificationService } from './logisticsNotificationService';

export class OrderService extends MongooseCommonService<IOrder, IOrderDocument> implements IOrderService {
  private couponService = new CouponService();
  private loyaltyService = new LoyaltyService();
  private pulseService = pulseService;

  constructor() {
    super(OrderModel);
  }

  generateOrderNumber = (): string => {
    const date = new Date();
    const prefix = 'ORD';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${random}`;
  };

  createOrder = async (orderData: TOrderCreateReq, userId: any): Promise<IOrder> => {
    // 1. Calculate and Validate Subtotal from DB prices (Anti-Tamper)
    let subTotal = 0;
    if (!orderData.items || orderData.items.length === 0) {
      throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 'Order items are missing');
    }

    for (const item of orderData.items) {
      let actualPrice = 0;
      let found = false;

      // 1. Try SKU first
      if (item.skuId) {
        const sku = await SkuModel.findById(item.skuId).lean();
        if (sku) {
          actualPrice = Number(sku.offerPrice || sku.salePrice || sku.basePrice || 0);
          if (actualPrice > 0) found = true;
        }
      }

      // 2. Try Product if SKU failed or has no price
      if (!found && item.productId) {
        const product = await ProductModel.findById(item.productId).lean();
        if (product) {
          actualPrice = Number(product.offerPrice || product.salePrice || product.basePrice || 0);
          if (actualPrice > 0) found = true;
        }
      }

      if (!found || actualPrice <= 0) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
          `Pricing Resolution Failure: ${item.name} (SKU:${item.skuId} / PRD:${item.productId}) has no valid market price.`
        );
      }

      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) {
         throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Invalid quantity for ${item.name}`);
      }

      item.price = actualPrice;
      item.total = actualPrice * quantity;
      subTotal += item.total;
    }
    console.log(`Backend Subtotal Resolved: ${subTotal}`);

    let discountAmount = 0;
    let couponCode = orderData.couponCode;

    // 2. Handle Coupon
    if (couponCode) {
      const coupon = await this.couponService.validateCoupon(couponCode, subTotal, userId);
      
      if (coupon.type === COUPON_TYPE.PERCENTAGE) {
        discountAmount = (subTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.value;
      }

      // Increment coupon usage count
      await this.couponService.updateOne(
        { _id: coupon._id }, 
        { $inc: { usageCount: 1 } }
      );
    }

    // 3. Generate Order Number
    const orderNumber = this.generateOrderNumber();

    // 4. Handle Loyalty Points
    let pointsUsed = orderData.pointsUsed || 0;
    let pointsAmount = 0;

    if (pointsUsed > 0) {
      if (pointsUsed < LOYALTY_CONFIG.MIN_REDEMPTION_POINTS) {
         throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Minimum ${LOYALTY_CONFIG.MIN_REDEMPTION_POINTS} points required for redemption`);
      }
      pointsAmount = pointsUsed * LOYALTY_CONFIG.POINTS_PER_RUPEE;
      
      // Points cannot exceed subtotal (usually)
      if (pointsAmount > (subTotal - discountAmount)) {
          pointsAmount = subTotal - discountAmount;
          pointsUsed = Math.ceil(pointsAmount / LOYALTY_CONFIG.POINTS_PER_RUPEE);
      }

      await this.loyaltyService.updateBalance(
        userId.toString(), 
        -pointsUsed, 
        LOYALTY_TRANSACTION_TYPE.SPENT, 
        `Applied to Order #${orderNumber}`
      );
    }

    // 5. Calculate Final Total
    const tax = 0; // Tax logic should be here
    const shippingCost = subTotal > 499 ? 0 : 40;
    const finalCalculatedTotal = subTotal + tax + shippingCost - discountAmount - pointsAmount;

    // SECURITY CHECK: Verify if frontend's perceived total matches backend's calculated total
    if (Math.abs(finalCalculatedTotal - orderData.totalAmount) > 0.01) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
        `Payment Integrity Error: State[ST:${subTotal}, TX:${tax}, SH:${shippingCost}, DA:${discountAmount}, PA:${pointsAmount}, FT:${finalCalculatedTotal}, FE:${orderData.totalAmount}, IC:${orderData.items?.length}]`
      );
    }

    // 5.5 RTO Risk Assessment
    const rtoScore = await rtoScoreService.calculateRiskScore(
      userId.toString(),
      orderData.shippingAddress.pincode,
      finalCalculatedTotal,
      orderData.paymentMethod
    );

    if (rtoScore.suggestedAction === 'BLOCK_COD') {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        'COD not available for this transaction risk. Please use Online Payment.'
      );
    }

    // 6. Create Order
    const newOrder = await this.create({
      ...orderData,
      userId,
      orderNumber,
      subTotal,
      discountAmount,
      pointsUsed,
      pointsAmount,
      totalAmount: finalCalculatedTotal,
      orderStatus: (orderData.paymentMethod === 'COD' && rtoScore.suggestedAction === 'FLAG') ? 'PENDING' : 'CONFIRMED',
      paymentStatus: 'PENDING',
      timeline: [{
        status: 'PENDING',
        timestamp: new Date(),
        message: rtoScore.suggestedAction === 'FLAG' ? 'Order flagged for RTO risk review' : 'Order placed successfully'
      }]
    } as any);

    // 7. Save RTO Score linked to order
    rtoScore.orderId = (newOrder as any)._id;
    await rtoScoreService.saveRiskScore(rtoScore);

    // 8. Update User Metrics
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { 'metrics.totalOrders': 1 }
    });

    // Update the transaction with the orderId now that we have it
    if (pointsUsed > 0) {
        await this.loyaltyService.updateOne(
            { userId, orderId: { $exists: false }, type: LOYALTY_TRANSACTION_TYPE.SPENT },
            { orderId: (newOrder as any)._id }
        );
    }

    return newOrder;
  };
  
  getMyOrders = async (userId: string, filter: any, options: any) => {
    const userFilter = { ...filter, userId };
    return this.findAllWithPagination(userFilter, options);
  };

  updateOrderStatus = async (orderId: string, status: string, userId: any) => {
    const order = await this.findById(orderId);
    if (!order) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Order not found');
    }

    const currentStatus = order.orderStatus;
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['RETURNED'],
      CANCELLED: [],
      RETURNED: []
    };

    if (currentStatus !== status && !allowedTransitions[currentStatus]?.includes(status)) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
        `Cannot transition order from ${currentStatus} to ${status}`
      );
    }
    
    const timelineEntry = {
      status,
      timestamp: new Date(),
      message: `Order status updated to ${status}`
    };

    const updateData: any = { 
      orderStatus: status,
      $push: { timeline: timelineEntry }
    };

    // --- PHASE 3: FULFILLMENT LOGIC ---
    
    // 1. Stock Deduction on Confirmation
    if (status === 'CONFIRMED' && currentStatus === 'PENDING') {
      for (const item of order.items) {
        if (item.skuId) {
          const sku = await SkuModel.findById(item.skuId);
          if (sku) {
            const previousQuantity = sku.quantity;
            sku.quantity -= item.quantity;
            await sku.save();

            // Log Inventory Audit
            await inventoryAuditService.logAdjustment({
              skuId: item.skuId.toString(),
              transactionType: 'ORDER_FULFILLMENT',
              changeQuantity: -item.quantity,
              previousQuantity,
              newQuantity: sku.quantity,
              referenceId: orderId,
              referenceType: 'ORDER',
              reason: `Order #${order.orderNumber} confirmed (SKU)`
            });
          } else if (item.productId) {
            const product = await ProductModel.findById(item.productId);
            if (product) {
              const previousQuantity = product.stock || 0;
              product.stock = (product.stock || 0) - item.quantity;
              await product.save();

              await inventoryAuditService.logAdjustment({
                productId: item.productId.toString(),
                transactionType: 'ORDER_FULFILLMENT',
                changeQuantity: -item.quantity,
                previousQuantity,
                newQuantity: product.stock,
                referenceId: orderId,
                referenceType: 'ORDER',
                reason: `Order #${order.orderNumber} confirmed (Product)`
              } as any);
            }
          }
        }
      }
    }

    // 1.5 Notification on Confirmation
    if (status === 'CONFIRMED' && currentStatus === 'PENDING') {
      await logisticsNotificationService.notifyOrderConfirmed(order);
    }

    // 2. Logistics Integration on Shipping
    if (status === 'SHIPPED' && currentStatus === 'PROCESSING') {
      try {
        const shipment = await logisticsService.createShipment((order as any)._id.toString());
        updateData.shippingProvider = shipment.carrier;
        updateData.trackingId = shipment.trackingId;
        updateData.estimatedDelivery = shipment.estimatedDelivery;
        updateData.shippingLabelUrl = shipment.labelUrl;

        // Notification on Shipping
        await logisticsNotificationService.notifyOrderShipped(order, shipment);
      } catch (err) {
        console.error('Logistics service failure:', err);
        // We continue with status update but log the error
      }
    }

    // 3. Restocking on Cancellation
    if (status === 'CANCELLED' && ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(currentStatus)) {
      for (const item of order.items) {
        if (item.skuId) {
          const sku = await SkuModel.findById(item.skuId);
          if (sku) {
            const previousQuantity = sku.quantity;
            sku.quantity += item.quantity;
            await sku.save();

            // Log Inventory Audit
            await inventoryAuditService.logAdjustment({
              skuId: item.skuId.toString(),
              transactionType: 'ORDER_CANCEL',
              changeQuantity: item.quantity,
              previousQuantity,
              newQuantity: sku.quantity,
              referenceId: orderId,
              referenceType: 'ORDER',
              reason: `Order #${order.orderNumber} cancelled (SKU)`
            });
          } else if (item.productId) {
            const product = await ProductModel.findById(item.productId);
            if (product) {
              const previousQuantity = product.stock || 0;
              product.stock = (product.stock || 0) + item.quantity;
              await product.save();

              await inventoryAuditService.logAdjustment({
                productId: item.productId.toString(),
                transactionType: 'ORDER_CANCEL',
                changeQuantity: item.quantity,
                previousQuantity,
                newQuantity: product.stock,
                referenceId: orderId,
                referenceType: 'ORDER',
                reason: `Order #${order.orderNumber} cancelled (Product)`
              } as any);
            }
          }
        }
      }
    }

    // 3.5 User Metrics Update
    if (status === 'DELIVERED' && currentStatus !== 'DELIVERED') {
      await UserModel.findByIdAndUpdate(order.userId, { $inc: { 'metrics.deliveredCount': 1 } });
    } else if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      await UserModel.findByIdAndUpdate(order.userId, { $inc: { 'metrics.cancelledCount': 1 } });
    }

    // 4. Loyalty Point Accretion on Delivery
    if (status === 'DELIVERED' && currentStatus !== 'DELIVERED') {
        const points = this.loyaltyService.calculateEarnedPoints(order.totalAmount);
        if (points > 0) {
            await this.loyaltyService.updateBalance(
                order.userId.toString(),
                points,
                LOYALTY_TRANSACTION_TYPE.EARNED,
                `Earned from Order #${order.orderNumber}`,
                orderId
            );
        }
        
        // Pulse Engagement: Feedback request & Points Notification
        await this.pulseService.triggerFeedbackRequest(order);
        if (points > 0) {
            await this.pulseService.triggerLoyaltyAccretionPulse(order.userId.toString(), points, order.orderNumber);
        }
    }

    // 5. Loyalty Point Reversal on Cancellation
    if (status === 'CANCELLED' && order.pointsUsed && order.pointsUsed > 0) {
        await this.loyaltyService.updateBalance(
            order.userId.toString(),
            order.pointsUsed,
            LOYALTY_TRANSACTION_TYPE.REFUNDED,
            `Refunded from Cancelled Order #${order.orderNumber}`,
            orderId
        );
    }

    return this.updateOne(
      { _id: orderId }, 
      updateData, 
      { userId }
    );
  };

  simulateLogisticsUpdate = async (orderId: string) => {
    const order = await this.findById(orderId);
    if (!order) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Order not found');
    }

    if (order.orderStatus !== 'SHIPPED') {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
        'Simulation only available for SHIPPED orders'
      );
    }

    const updates = [
      'Arrived at Sort Facility',
      'Processed through Gateway',
      'Departure from Hub India',
      'In transit to delivery center',
      'Reached destination city',
      'Assigned to delivery agent'
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];

    const timelineEntry = {
      status: 'SHIPPED',
      timestamp: new Date(),
      message: `[Logistics Hub] ${randomUpdate}`
    };

    return this.updateOne(
      { _id: orderId },
      { $push: { timeline: timelineEntry } }
    );
  };
}
