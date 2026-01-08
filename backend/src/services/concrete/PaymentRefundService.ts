import { PaymentRefundModel } from '../../db/mongodb/models/paymentRefundModel';
import { PaymentModel } from '../../db/mongodb/models/paymentModel';
import { IPaymentRefundDocument } from '../../interfaces/paymentRefund';
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
  ): Promise<IPaymentRefundDocument> {
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
              gatewayRefundId: refundResponse.refundId,
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

    return (await PaymentRefundModel.findById(refund._id))!;
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
  }

  /**
   * Get refund by ID
   */
  async getRefundById(refundId: string): Promise<IPaymentRefundDocument | null> {
    return await PaymentRefundModel.findById(refundId).lean();
  }

  /**
   * Get refund by refund number
   */
  async getRefundByNumber(refundNumber: string): Promise<IPaymentRefundDocument | null> {
    return await PaymentRefundModel.findOne({ refundNumber }).lean();
  }

  /**
   * Get refunds for a payment
   */
  async getRefundsByPaymentId(paymentId: string): Promise<IPaymentRefundDocument[]> {
    return await PaymentRefundModel.find({ paymentId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get refunds for an order
   */
  async getRefundsByOrderId(orderId: string): Promise<IPaymentRefundDocument[]> {
    return await PaymentRefundModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get refunds for a user
   */
  async getRefundsByUserId(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPaymentRefundDocument[]> {
    return await PaymentRefundModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }
}
