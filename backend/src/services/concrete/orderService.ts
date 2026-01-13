import { MongooseCommonService } from './mongooseCommonService';
import { OrderModel } from '../../db/mongodb/models/orderModel';
import { TOrderCreateReq } from '../../types/order';
import { IOrderAttributes, IOrderDocument } from '../../interfaces';
import { couponService } from './couponService';
import { logisticsService } from './logisticsService';
import { walletService } from './walletService';
import { walletRuleService } from './walletRuleService';
import { walletTransactionService } from './walletTransactionService';
import { pulseService } from './pulseService';
import { skuService } from './skuService';
import { productService } from './productService';
import { userService } from './userService';
import { paymentService } from './paymentService';
import { COUPON_TYPE } from '../../constants/coupon';
import { WALLET_TRANSACTION_TYPE, WALLET_SOURCE_TYPE, WALLET_CREATED_BY } from '../../constants/walletTransaction';
import { WALLET_RULE_TYPE } from '../../constants/walletRule';
import { rtoScoreService } from './rtoScoreService';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

import { inventoryService } from './inventoryService';
import { IOrderService } from '../contracts/orderServiceInterface';

// import { IOrderDocument } from '../../db/mongodb/models/orderModel';
import { logisticsNotificationService } from './logisticsNotificationService';
import { paymentRefundService } from './paymentRefundService';
import { REFUND_REASON } from '../../constants/payment';
import { orderQueue } from '../../jobs/order/queue';
import { logisticsQueue } from '../../jobs/logistics/queue';
import { BULL_QUEUES } from '../../constants/bullQueue';

export class OrderService extends MongooseCommonService<IOrderAttributes, IOrderDocument> implements IOrderService {
  private get couponService() { return couponService; }
  private get walletService() { return walletService; }
  private get walletRuleService() { return walletRuleService; }
  private get walletTransactionService() { return walletTransactionService; }
  private get pulseService() { return pulseService; }
  private get skuService() { return skuService; }
  private get productService() { return productService; }
  private get userService() { return userService; }
  private get paymentService() { return paymentService; }
  private get refundService() { return paymentRefundService; }

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

  createOrder = async (orderData: TOrderCreateReq, userId: any): Promise<IOrderAttributes> => {
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
        const sku = await this.skuService.findById(item.skuId.toString());
        if (sku) {
          actualPrice = Number((sku as any).offerPrice || (sku as any).salePrice || (sku as any).basePrice || 0);
          if (actualPrice > 0) found = true;
        }
      }

      // 2. Try Product if SKU failed or has no price
      if (!found && item.productId) {
        const product = await this.productService.findById(item.productId.toString());
        if (product) {
          actualPrice = Number((product as any).offerPrice || (product as any).salePrice || (product as any).basePrice || 0);
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
    const couponCode = orderData.couponCode;

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

      // Save couponId to orderData for DB creation
      (orderData as any).couponId = coupon._id;

      // Increment coupon usage count
      await this.couponService.updateOne(
        { _id: coupon._id }, 
        { $inc: { usageCount: 1 } }
      );
    }

    // 3. Generate Order Number
    const orderNumber = this.generateOrderNumber();

    // 4. Handle Wallet Balance Deduction
    let walletAmountUsed = orderData.walletAmountUsed || 0;

    if (walletAmountUsed > 0) {
      const userWallet = await this.walletService.getOrCreateWallet(userId.toString());
      
      if (userWallet.availableBalance < walletAmountUsed) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
          `Insufficient wallet balance. Available: ₹${userWallet.availableBalance}`
        );
      }
      
      // Wallet amount cannot exceed remaining payable amount
      if (walletAmountUsed > (subTotal - discountAmount)) {
        walletAmountUsed = subTotal - discountAmount;
      }

      // Deduct wallet balance
      await this.walletService.debitWallet(
        userId.toString(), 
        walletAmountUsed,
        {
          description: `Applied to Order #${orderNumber}`,
          orderId: null, // Will be updated after order creation
          createdByType: WALLET_CREATED_BY.USER
        }
      );

      // Create wallet transaction record
      await this.walletTransactionService.createTransaction({
        walletId: (userWallet as any)._id.toString(),
        userId: userId.toString(),
        transactionType: WALLET_TRANSACTION_TYPE.DEBIT,
        sourceType: WALLET_SOURCE_TYPE.ORDER_PAYMENT,
        amount: walletAmountUsed,
        balanceBefore: userWallet.availableBalance,
        balanceAfter: userWallet.availableBalance - walletAmountUsed,
        description: `Payment for Order #${orderNumber}`,
        sourceReferenceId: undefined, // Will be set after order creation
        createdBy: WALLET_CREATED_BY.USER
      });
    }

    // 5. Calculate Final Total
    // Assuming prices are inclusive of 18% GST (Tax component extraction)
    const taxRate = 18;
    const taxIncluded = Math.round((subTotal * taxRate) / (100 + taxRate));
    const tax = 0; // No additional tax added to total
    const shippingCost = subTotal > 499 ? 0 : 40;
    const finalCalculatedTotal = subTotal + tax + shippingCost - discountAmount - walletAmountUsed;

    // SECURITY CHECK: Verify if frontend's perceived total matches backend's calculated total
    if (Math.abs(finalCalculatedTotal - orderData.totalAmount) > 0.01) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
        `Payment Integrity Error: State[ST:${subTotal}, TX:${tax}, SH:${shippingCost}, DA:${discountAmount}, WA:${walletAmountUsed}, FT:${finalCalculatedTotal}, FE:${orderData.totalAmount}, IC:${orderData.items?.length}]`
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

    // 6. Calculate Cashback
    const cashbackResult = await this.walletRuleService.calculateCashback(
      finalCalculatedTotal,
      WALLET_RULE_TYPE.ORDER_CASHBACK
    );

    // 7. Create Order
    const newOrder = await this.create({
      ...orderData,
      userId,
      orderNumber,
      subTotal,
      discountAmount,
      walletAmountUsed,
      cashbackAmount: cashbackResult.cashbackAmount,
      tax: taxIncluded, // Save extracted tax component
      totalAmount: finalCalculatedTotal,
      orderStatus: (orderData.paymentMethod === 'COD' && rtoScore.suggestedAction === 'FLAG') ? 'PENDING' : 'CONFIRMED',
      paymentStatus: 'PENDING',
      timeline: [{
        status: 'PENDING',
        timestamp: new Date(),
        message: rtoScore.suggestedAction === 'FLAG' ? 'Order flagged for RTO risk review' : 'Order placed successfully'
      }]
    } as any);

    // 8. Save RTO Score linked to order
    rtoScore.orderId = (newOrder as any)._id;
    await rtoScoreService.saveRiskScore(rtoScore);

    // 9. Update User Metrics
    await this.userService.updateOne({ _id: userId } as any, {
      $inc: { 'metrics.totalOrders': 1 }
    } as any);

    // 10. Create Pending Cashback Transaction (if applicable)
    if (cashbackResult.cashbackAmount > 0) {
      const userWallet = await this.walletService.getOrCreateWallet(userId.toString());
      
      await this.walletTransactionService.createTransaction({
        walletId: (userWallet as any)._id.toString(),
        userId: userId.toString(),
        transactionType: WALLET_TRANSACTION_TYPE.CREDIT,
        sourceType: WALLET_SOURCE_TYPE.ORDER_CASHBACK,
        sourceReferenceId: (newOrder as any)._id.toString(),
        amount: cashbackResult.cashbackAmount,
        balanceBefore: userWallet.availableBalance,
        balanceAfter: userWallet.availableBalance, // Not credited yet, still PENDING
        description: `Cashback for Order #${orderNumber} (Pending Delivery)`,
        expiryDate: cashbackResult.expiryDate || undefined,
        createdBy: WALLET_CREATED_BY.SYSTEM,
        metadata: {
          ruleId: cashbackResult.appliedRule ? (cashbackResult.appliedRule as any)._id : null,
          orderAmount: finalCalculatedTotal
        }
      });

      // Block the cashback amount
      await this.walletService.blockBalance(userId.toString(), cashbackResult.cashbackAmount);
    }

    // 11. Enqueue Post-Order Actions
    await orderQueue.queue.add(BULL_QUEUES.ORDER.JOBS.PROCESS_ORDER_PLACED, {
        orderId: (newOrder as any)._id.toString(),
        userId: userId.toString()
    });

    // 12. Create Financial Income Record
    try {
      const { financialRecordService } = await import('./financialRecordService');
      await financialRecordService.createAutomaticIncomeRecord(
        (newOrder as any)._id.toString(),
        finalCalculatedTotal,
        new Date()
      );
      console.log(`✅ Financial income record created for Order #${orderNumber}`);
    } catch (error) {
      console.error(`❌ Failed to create financial record for Order #${orderNumber}:`, error);
      // Don't fail the order creation if financial record fails
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
        await inventoryService.deductStock({
          skuId: item.skuId?.toString(),
          productId: item.productId?.toString(),
          quantity: item.quantity,
          referenceId: orderId,
          referenceType: 'ORDER',
          reason: `Order #${order.orderNumber} confirmed`
        });
      }
    }

    // 1.5 Notification & Invoice on Confirmation
    if (status === 'CONFIRMED' && currentStatus === 'PENDING') {
      await logisticsNotificationService.notifyOrderConfirmed(order);
      
      // Enqueue Invoice Generation
      await orderQueue.queue.add(BULL_QUEUES.ORDER.JOBS.GENERATE_INVOICE, {
        orderId: orderId.toString()
      });
    }

    // 2. Logistics Integration on Shipping
    if (status === 'SHIPPED' && currentStatus === 'PROCESSING') {
      // Offload to background queue
      await logisticsQueue.queue.add(BULL_QUEUES.LOGISTICS.JOBS.PUSH_TO_LOGISTICS, {
        orderId: orderId.toString()
      });
      
      console.log(`[OrderService] Offloaded PUSH_TO_LOGISTICS for Order #${order.orderNumber}`);
    }

    // 3. Stock Reversal on Cancellation
    if (status === 'CANCELLED' && (currentStatus === 'CONFIRMED' || currentStatus === 'PROCESSING' || currentStatus === 'SHIPPED')) {
      // Revert Coupon Usage
      if (order.couponCode) {
        await this.couponService.revertUsage(order.couponCode);
      }

      for (const item of order.items) {
        await inventoryService.restock({
          skuId: item.skuId?.toString(),
          productId: item.productId?.toString(),
          quantity: item.quantity,
          referenceId: orderId,
          referenceType: 'ORDER',
          reason: `Order #${order.orderNumber} cancelled`
        });
      }

      // 3.1. Automatic Refund for Online Payments
      if (order.paymentMethod !== 'COD' && order.paymentStatus === 'COMPLETED') {
        const payment = await this.paymentService.findOne({ orderId, status: 'SUCCESS' } as any);
        if (payment) {
          try {
            await this.refundService.initiateRefund(
              (payment as any)._id.toString(),
              order.totalAmount,
              REFUND_REASON.CANCELLATION,
              `Order #${order.orderNumber} cancelled by ${userId.toString() === (order as any).userId.toString() ? 'customer' : 'admin'}`,
              userId.toString()
            );
            console.log(`✅ Auto-refund initiated for Order #${order.orderNumber}`);
          } catch (refundError) {
            console.error(`❌ Auto-refund failed for Order #${order.orderNumber}:`, refundError);
          }
        }
      }
    }

    // 3.5 User Metrics Update
    if (status === 'DELIVERED' && currentStatus !== 'DELIVERED') {
      await this.userService.updateOne({ _id: (order as any).userId } as any, { $inc: { 'metrics.deliveredCount': 1 } } as any);
    } else if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      await this.userService.updateOne({ _id: (order as any).userId } as any, { $inc: { 'metrics.cancelledCount': 1 } } as any);
    }

    // 4. Confirm Cashback on Delivery
    if (status === 'DELIVERED' && currentStatus !== 'DELIVERED') {
        // Find pending cashback transaction for this order
        const pendingTransactions = await this.walletTransactionService.getTransactionsBySource(
          orderId.toString(),
          WALLET_SOURCE_TYPE.ORDER_CASHBACK
        );

        for (const transaction of pendingTransactions) {
          if ((transaction as any).status === 'PENDING') {
            // Confirm the transaction
            await this.walletTransactionService.confirmTransaction((transaction as any)._id.toString());
            
            // Release blocked balance and credit to available
            await this.walletService.releaseBlockedBalance(
              order.userId.toString(),
              transaction.amount
            );

            console.log(`✅ Cashback of ₹${transaction.amount} confirmed for Order #${order.orderNumber}`);

            // Notify user about cashback
            await this.pulseService.triggerWalletCreditPulse(
                order.userId.toString(),
                transaction.amount,
                order.orderNumber
            );
          }
        }
        
        // Pulse Engagement: Feedback request
        await this.pulseService.triggerFeedbackRequest(order);
    }

    // 5. Reverse Cashback on Cancellation
    if (status === 'CANCELLED') {
      // Reverse any pending cashback
      const pendingTransactions = await this.walletTransactionService.getTransactionsBySource(
        orderId.toString(),
        WALLET_SOURCE_TYPE.ORDER_CASHBACK
      );

      for (const transaction of pendingTransactions) {
        if ((transaction as any).status === 'PENDING') {
          // Reverse the transaction
          await this.walletTransactionService.reverseTransaction(
            (transaction as any)._id.toString(),
            `Order #${order.orderNumber} cancelled`
          );
          
          // Release blocked balance (without crediting)
          const userWallet = await this.walletService.getWalletByUserId(order.userId.toString());
          if (userWallet && userWallet.blockedBalance >= transaction.amount) {
            await this.walletService.findOneAndUpdate(
              { _id: (userWallet as any)._id },
              { $inc: { blockedBalance: -transaction.amount } }
            );
          }

          console.log(`❌ Cashback of ₹${transaction.amount} reversed for Order #${order.orderNumber}`);
        }
      }

      // Refund wallet amount if used
      if ((order as any).walletAmountUsed && (order as any).walletAmountUsed > 0) {
        await this.walletService.creditWallet(
          order.userId.toString(),
          (order as any).walletAmountUsed,
          {
            description: `Refund for cancelled Order #${order.orderNumber}`,
            orderId: orderId.toString(),
            createdByType: WALLET_CREATED_BY.SYSTEM
          }
        );

        await this.walletTransactionService.createTransaction({
          walletId: (await this.walletService.getWalletByUserId(order.userId.toString()) as any)._id.toString(),
          userId: order.userId.toString(),
          transactionType: WALLET_TRANSACTION_TYPE.CREDIT,
          sourceType: WALLET_SOURCE_TYPE.REFUND,
          sourceReferenceId: orderId.toString(),
          amount: (order as any).walletAmountUsed,
          balanceBefore: 0, // Will be calculated
          balanceAfter: 0, // Will be calculated
          description: `Wallet refund for cancelled Order #${order.orderNumber}`,
          createdBy: WALLET_CREATED_BY.SYSTEM
        });

        console.log(`💰 Wallet amount of ₹${(order as any).walletAmountUsed} refunded for Order #${order.orderNumber}`);
      }
    }

    return this.findOneAndUpdate(
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

    return this.findOneAndUpdate(
      { _id: orderId },
      { $push: { timeline: timelineEntry } }
    );
  };

  /**
   * Background Job: Process Post-Order Actions
   * Handles non-critical post-order tasks like notifications and analytics
   */
  processPostOrderActions = async (orderId: string, userId: string) => {
    const order = await this.findById(orderId);
    if (!order) return;

    // 1. Send Order Confirmation Notification
    // We use the existing logisticsNotificationService which abstracts the notification logic
    await logisticsNotificationService.notifyOrderConfirmed(order);

    // 2. Future: Check for automated fraud detection (if not done inline)
    
    // 3. Future: Update extensive analytics/recommendation engine
  };

  /**
   * Background Job: Generate Invoice
   * Generates PDF invoice and uploads to storage
   */
  generateInvoice = async (orderId: string) => {
    const order = await this.findById(orderId);
    if (!order) return;

    // TODO: Integrate actual PDF generation library (e.g., puppeteer, pdfkit)
    // For now, we simulate generation and S3 upload
    console.log(`[Mock] Generating PDF invoice for Order #${order.orderNumber}...`);
    
    const mockInvoiceUrl = `https://storage.kipi.com/invoices/${order.orderNumber}.pdf`;
    
    // Update order with invoice URL
    await this.updateOne(
        { _id: orderId } as any,
        { invoiceUrl: mockInvoiceUrl } as any
    );
    
    console.log(`[Mock] Invoice generated and linked: ${mockInvoiceUrl}`);
  };
}

export const orderService = new OrderService();
