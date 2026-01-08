import { PaymentRefundModel } from '../../db/mongodb/models/paymentRefundModel';
import { PaymentModel } from '../../db/mongodb/models/paymentModel';
import { OrderModel } from '../../db/mongodb/models/orderModel';
import { ReturnModel } from '../../db/mongodb/models/returnModel';
import { IPaymentRefundAttributes, IPaymentRefundDocument } from '../../interfaces/paymentRefund';
import { PaymentGatewayService } from './PaymentGatewayService';
import { IPaymentRefundServiceContract } from '../contracts/IPaymentRefundServiceContract';
import { REFUND_STATUS, REFUND_REASON, PAYMENT_STATUS, PAYMENT_ERROR_MESSAGES } from '../../constants/payment';

/**
 * Payment Refund Service
 * Manages refund operations for payments
 */
export class PaymentRefundService implements IPaymentRefundServiceContract {
  private paymentGatewayService: PaymentGatewayService;

  constructor() {
    this.paymentGatewayService = new PaymentGatewayService();
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
    const payment = await PaymentModel.findById(paymentId);
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
    const refund = await PaymentRefundModel.create({
      paymentId,
      orderId: payment.orderId,
      userId: payment.userId,
      refundNumber,
      gatewayName: payment.gatewayName,
      amount,
      reason,
      notes,
      status: REFUND_STATUS.INITIATED,
      initiatedAt: new Date(),
      initiatedBy
    });

    try {
      // Get gateway service
      const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);

      // Initiate refund with gateway
      const refundResponse = await gatewayService.refundPayment(payment, amount, notes);

      if (refundResponse.success) {
        // Update refund with gateway details
        await PaymentRefundModel.updateOne(
          { _id: refund._id },
          {
            $set: {
              gatewayRefundId: refundResponse.gatewayRefundId,
              status: REFUND_STATUS.PENDING,
              gatewayResponse: refundResponse.gatewayResponse
            }
          }
        );

        // Update payment refund tracking
        await PaymentModel.updateOne(
          { _id: paymentId },
          {
            $inc: {
              refundedAmount: amount,
              refundCount: 1
            },
            $set: {
              status: amount === payment.amount ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIAL_REFUND
            }
          }
        );
      } else {
        // Mark refund as failed
        await PaymentRefundModel.updateOne(
          { _id: refund._id },
          {
            $set: {
              status: REFUND_STATUS.FAILED,
              failedAt: new Date(),
              failureReason: refundResponse.error,
              gatewayResponse: refundResponse
            }
          }
        );
        throw new Error(refundResponse.error || 'Refund initiation failed');
       }
    } catch (error: any) {
      // Mark refund as failed
      await PaymentRefundModel.updateOne(
        { _id: refund._id },
        {
          $set: {
            status: REFUND_STATUS.FAILED,
            failedAt: new Date(),
            failureReason: error.message
          }
        }
      );
      throw error;
    }

    return (await PaymentRefundModel.findById(refund._id).lean()) as IPaymentRefundAttributes;
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

    await PaymentRefundModel.updateOne({ _id: refundId }, { $set: updateData });

    // Synchronization with Order and Return models
    const refund = await PaymentRefundModel.findById(refundId);
    if (!refund) return;

    if (status === REFUND_STATUS.SUCCESS) {
      // 1. Update Payment status
      const payment = await PaymentModel.findById(refund.paymentId);
      if (payment) {
        const newStatus = payment.refundedAmount >= payment.amount 
          ? PAYMENT_STATUS.REFUNDED 
          : PAYMENT_STATUS.PARTIAL_REFUND;
          
        await PaymentModel.updateOne(
          { _id: payment._id },
          { $set: { status: newStatus } }
        );

        // 2. Update Order status
        await OrderModel.updateOne(
          { _id: refund.orderId },
          { $set: { paymentStatus: newStatus as any } }
        );
      }

      // 3. Update Return status if applicable
      await ReturnModel.findOneAndUpdate(
        { 
          orderId: refund.orderId,
          refundStatus: { $ne: 'PROCESSED' }
        },
        { 
          $set: { 
            refundStatus: 'PROCESSED',
            refundTransactionId: refund.gatewayRefundId || refund.refundNumber
          } 
        }
      );
    } else if (status === REFUND_STATUS.FAILED) {
      // 1. Update Order payment status
      await OrderModel.updateOne(
        { _id: refund.orderId },
        { $set: { paymentStatus: 'FAILED' } }
      );

      // 2. Update Return status if applicable
      await ReturnModel.findOneAndUpdate(
        { 
          orderId: refund.orderId,
          refundStatus: { $ne: 'PROCESSED' }
        },
        { 
          $set: { 
            refundStatus: 'FAILED',
            status: 'REJECTED' // "should be failed automatically"
          } 
        }
      );
    }
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string): Promise<IPaymentRefundAttributes | null> {
    return await PaymentRefundModel.findById(refundId).lean();
  }

  /**
   * Get refund by refund number
   */
  async getRefundByNumber(refundNumber: string): Promise<IPaymentRefundAttributes | null> {
    return await PaymentRefundModel.findOne({ refundNumber }).lean();
  }

  /**
   * Get refunds for a payment
   */
  async getRefundsByPaymentId(paymentId: string): Promise<IPaymentRefundAttributes[]> {
    return await PaymentRefundModel.find({ paymentId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get refunds for an order
   */
  async getRefundsByOrderId(orderId: string): Promise<IPaymentRefundAttributes[]> {
    return await PaymentRefundModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get refunds for a user
   */
  async getRefundsByUserId(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPaymentRefundAttributes[]> {
    return await PaymentRefundModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }

  /**
   * Fetch refund status from gateway
   */
  async fetchRefundStatus(refundId: string): Promise<any> {
    const refund = await PaymentRefundModel.findById(refundId);
    if (!refund) {
      throw new Error('Refund not found');
    }

    const payment = await PaymentModel.findById(refund.paymentId);
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
