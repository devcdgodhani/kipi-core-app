import { IPaymentAttributes } from '../../interfaces/payment';
import { PAYMENT_GATEWAY } from '../../constants/payment';

/**
 * Payment Service Contract
 * Interface for core payment orchestration operations
 */
export interface IPaymentServiceContract {
  /**
   * Initiate payment for an order
   */
  initiatePayment(
    orderId: string,
    gatewayName: PAYMENT_GATEWAY,
    userId: string
  ): Promise<{
    payment: IPaymentAttributes;
    redirectUrl?: string;
    redirectMethod?: 'GET' | 'POST';
    gatewayData?: any;
  }>;

  /**
   * Verify payment after callback
   */
  verifyPayment(paymentId: string, gatewayData: any): Promise<IPaymentAttributes>;

  /**
   * Get payment by ID
   */
  getPaymentById(paymentId: string): Promise<IPaymentAttributes | null>;

  /**
   * Get payment by internal payment ID
   */
  getPaymentByInternalId(internalPaymentId: string): Promise<IPaymentAttributes | null>;

  /**
   * Get payments for an order
   */
  getPaymentsByOrderId(orderId: string): Promise<IPaymentAttributes[]>;

  /**
   * Get payments for a user
   */
  getPaymentsByUserId(
    userId: string,
    limit?: number,
    skip?: number
  ): Promise<IPaymentAttributes[]>;

  /**
   * Fetch payment status from gateway
   */
  fetchPaymentStatus(paymentId: string): Promise<any>;
}
