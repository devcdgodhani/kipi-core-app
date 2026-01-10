import { PaymentRefundModel } from '../../db/mongodb/models/paymentRefundModel';
import { IPaymentRefundAttributes, IPaymentRefundDocument } from '../../interfaces/paymentRefund';
import { paymentGatewayService } from './paymentGatewayService';
import { IPaymentRefundService } from '../contracts/paymentRefundServiceInterface';
import { REFUND_STATUS, REFUND_REASON, PAYMENT_STATUS, PAYMENT_ERROR_MESSAGES } from '../../constants/payment';
import { MongooseCommonService } from './mongooseCommonService';
import { paymentService } from './paymentService';
import { orderService } from './orderService';
import { returnService } from './returnService';

/**
 * Payment Refund Service
 * Manages refund operations for payments
 */
export class PaymentRefundService extends MongooseCommonService<IPaymentRefundAttributes, IPaymentRefundDocument> implements IPaymentRefundService {
  private get paymentGatewayService() { return paymentGatewayService; }
  private get paymentService() { return paymentService; }
  private get orderService() { return orderService; }

  constructor() {
    super(PaymentRefundModel as any);
  }

  /**
   * Generate unique refund number
   */
  private generateRefundNumber(): string {
    return `REFUND_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  /**
   * Initiate refund for a payment
   */
  async initiateRefund(
    paymentId: string,
    amount: number,
    reason: REFUND_REASON,
    notes: string | undefined,
    initiatedBy: string
  ): Promise<IPaymentRefundAttributes> {
    // Fetch payment
    const payment = await this.paymentService.findById(paymentId);
    if (!payment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    // Validate payment status
    if (payment.status !== PAYMENT_STATUS.SUCCESS) {
      throw new Error(PAYMENT_ERROR_MESSAGES.INVALID_PAYMENT_STATUS);
    }

    // Validate refund amount
    const refundableAmount = payment.amount - payment.refundedAmount;
    if (amount > refundableAmount) {
      throw new Error(PAYMENT_ERROR_MESSAGES.REFUND_AMOUNT_EXCEEDS);
    }

    // Create refund record
    const refundNumber = this.generateRefundNumber();
    const refund = await this.create({
      paymentId,
      orderId: (payment as any).orderId,
      userId: (payment as any).userId,
      refundNumber,
      gatewayName: (payment as any).gatewayName,
      amount,
      reason,
      notes,
      status: REFUND_STATUS.INITIATED,
      initiatedAt: new Date(),
      initiatedBy
    } as any);

    try {
      // Get gateway service
      const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);

      // Initiate refund with gateway
      const refundResponse = await gatewayService.refundPayment(payment, amount, notes);

      if (refundResponse.success) {
        // Update refund with gateway details
        await this.updateOne(
          { _id: (refund as any)._id } as any,
          {
            $set: {
              gatewayRefundId: refundResponse.gatewayRefundId,
              status: REFUND_STATUS.PENDING,
              gatewayResponse: refundResponse.gatewayResponse
            }
          } as any
        );

        // Update payment refund tracking
        await this.paymentService.updateOne(
          { _id: paymentId } as any,
          {
            $inc: {
              refundedAmount: amount,
              refundCount: 1
            },
            $set: {
              status: amount === (payment as any).amount ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIAL_REFUND
            }
          } as any
        );
      } else {
        // Mark refund as failed
        await this.updateOne(
          { _id: (refund as any)._id } as any,
          {
            $set: {
              status: REFUND_STATUS.FAILED,
              failedAt: new Date(),
              failureReason: refundResponse.error,
              gatewayResponse: refundResponse
            }
          } as any
        );
        throw new Error(refundResponse.error || 'Refund initiation failed');
       }
    } catch (error: any) {
      // Mark refund as failed
      await this.updateOne(
        { _id: (refund as any)._id } as any,
        {
          $set: {
            status: REFUND_STATUS.FAILED,
            failedAt: new Date(),
            failureReason: error.message
          }
        } as any
      );
      throw error;
    }

    return (await this.findById((refund as any)._id)) as IPaymentRefundAttributes;
  }

  /**
   * Update refund status (typically called from webhook)
   */
  async updateRefundStatus(
    refundId: string,
    status: REFUND_STATUS,
    gatewayResponse?: any
  ): Promise<void> {
    const updateData: any = {
      status,
      processedAt: new Date()
    };

    if (status === REFUND_STATUS.SUCCESS) {
      updateData.completedAt = new Date();
    } else if (status === REFUND_STATUS.FAILED) {
      updateData.failedAt = new Date();
    }

    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }
 
    await this.updateOne({ _id: refundId } as any, { $set: updateData } as any);

    // Synchronization with Order and Return models
    const refund = await this.findById(refundId);
    if (!refund) return;

    if (status === REFUND_STATUS.SUCCESS) {
      // 1. Update Payment status
      const payment = await this.paymentService.findById((refund as any).paymentId);
      if (payment) {
        const newStatus = (payment as any).refundedAmount >= (payment as any).amount 
          ? PAYMENT_STATUS.REFUNDED 
          : PAYMENT_STATUS.PARTIAL_REFUND;
          
        await this.paymentService.updateOne(
          { _id: (payment as any)._id } as any,
          { $set: { status: newStatus } } as any
        );

        // 2. Update Order status
        await this.orderService.updateOne(
          { _id: (refund as any).orderId } as any,
          { $set: { paymentStatus: newStatus as any } } as any
        );
      }

      // 3. Update Return status if applicable
      await returnService.updateOne(
        { 
          orderId: (refund as any).orderId,
          refundStatus: { $ne: 'PROCESSED' }
        } as any,
        { 
          $set: { 
            refundStatus: 'PROCESSED',
            refundTransactionId: (refund as any).gatewayRefundId || (refund as any).refundNumber
          } 
        } as any
      );
    } else if (status === REFUND_STATUS.FAILED) {
      // 1. Update Order payment status
      await this.orderService.updateOne(
        { _id: (refund as any).orderId } as any,
        { $set: { paymentStatus: 'FAILED' } } as any
      );

      // 2. Update Return status if applicable
      await returnService.updateOne(
        { 
          orderId: (refund as any).orderId,
          refundStatus: { $ne: 'PROCESSED' }
        } as any,
        { 
          $set: { 
            refundStatus: 'FAILED',
            status: 'REJECTED' // "should be failed automatically"
          } 
        } as any
      );
    }
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string): Promise<IPaymentRefundAttributes | null> {
    return await this.findById(refundId);
  }

  /**
   * Get refund by refund number
   */
  async getRefundByNumber(refundNumber: string): Promise<IPaymentRefundAttributes | null> {
    return await this.findOne({ refundNumber } as any);
  }

  /**
   * Get refunds for a payment
   */
  async getRefundsByPaymentId(paymentId: string): Promise<IPaymentRefundAttributes[]> {
    return await this.findAll({ paymentId } as any, { sort: { createdAt: -1 } });
  }

  /**
   * Get refunds for an order
   */
  async getRefundsByOrderId(orderId: string): Promise<IPaymentRefundAttributes[]> {
    return await this.findAll({ orderId } as any, { sort: { createdAt: -1 } });
  }

  /**
   * Get refunds for a user
   */
  async getRefundsByUserId(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPaymentRefundAttributes[]> {
    return await this.findAll({ userId } as any, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
  }

  /**
   * Fetch refund status from gateway
   */
  async fetchRefundStatus(refundId: string): Promise<any> {
    const refund = await this.findById(refundId);
    if (!refund) {
      throw new Error('Refund not found');
    }

    const payment = await this.paymentService.findById((refund as any).paymentId);
    if (!payment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);
    const refundStatus = await gatewayService.fetchRefundStatus(refund.gatewayRefundId || refund.refundNumber);

    if (refundStatus.success) {
      await this.updateRefundStatus(refundId, refundStatus.status as REFUND_STATUS, refundStatus.metadata);
    }

    return refundStatus;
  }
}
 
export const paymentRefundService = new PaymentRefundService();
