import { FilterQuery, Model } from 'mongoose';
import { MongooseCommonService } from './mongooseCommonService';
import { OrderModel, SkuModel } from '../../db/mongodb';
import { IOrder, TOrderCreateReq } from '../../types/order';
import { CouponService } from './couponService';
import { inventoryAuditService } from './inventoryAuditService';
import { logisticsService } from './logisticsService';
import { COUPON_TYPE } from '../../constants/coupon';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import mongoose from 'mongoose';

export class OrderService extends MongooseCommonService<IOrder, any> {
  private couponService = new CouponService();

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
    // 1. Calculate Subtotal
    let subTotal = 0;
    orderData.items.forEach(item => {
      subTotal += item.price * item.quantity;
    });

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

    // 3. Calculate Final Total
    const tax = orderData.tax || 0;
    const shippingCost = orderData.shippingCost || 0;
    const totalAmount = subTotal + tax + shippingCost - discountAmount;

    // 4. Generate Order Number
    const orderNumber = this.generateOrderNumber();

    // 5. Create Order
    const newOrder = await this.create({
      ...orderData,
      userId,
      orderNumber,
      subTotal,
      discountAmount,
      totalAmount,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      timeline: [{
        status: 'PENDING',
        timestamp: new Date(),
        message: 'Order placed successfully'
      }]
    } as any);

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
              reason: `Order #${order.orderNumber} confirmed`
            });
          }
        }
      }
    }

    // 2. Logistics Integration on Shipping
    if (status === 'SHIPPED' && currentStatus === 'PROCESSING') {
      try {
        const shipment = await logisticsService.createShipment(order);
        updateData.shippingProvider = shipment.carrier;
        updateData.trackingId = shipment.trackingId;
        updateData.estimatedDelivery = shipment.estimatedDelivery;
        updateData.shippingLabelUrl = shipment.labelUrl;
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
              reason: `Order #${order.orderNumber} cancelled`
            });
          }
        }
      }
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
