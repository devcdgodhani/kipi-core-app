import { IPaymentRefundAttributes } from '../../interfaces/paymentRefund';
import { REFUND_STATUS, REFUND_REASON } from '../../constants/payment';

/**
 * Payment Refund Service Contract
 * Interface for refund operations
 */
export interface IPaymentRefundServiceContract {
  /**
   * Initiate refund for a payment
   */
  initiateRefund(
    paymentId: string,
    amount: number,
    reason: REFUND_REASON,
    notes: string | undefined,
    initiatedBy: string
  ): Promise<IPaymentRefundAttributes>;

  /**
   * Update refund status
   */
  updateRefundStatus(
    refundId: string,
    status: REFUND_STATUS,
    gatewayResponse?: any
  ): Promise<void>;

  /**
   * Get refund by ID
   */
  getRefundById(refundId: string): Promise<IPaymentRefundAttributes | null>;

  /**
   * Get refund by refund number
   */
  getRefundByNumber(refundNumber: string): Promise<IPaymentRefundAttributes | null>;

  /**
   * Get refunds for a payment
   */
  getRefundsByPaymentId(paymentId: string): Promise<IPaymentRefundAttributes[]>;

  /**
   * Get refunds for an order
   */
  getRefundsByOrderId(orderId: string): Promise<IPaymentRefundAttributes[]>;

  /**
   * Get refunds for a user
   */
  getRefundsByUserId(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<IPaymentRefundAttributes[]>;
}
