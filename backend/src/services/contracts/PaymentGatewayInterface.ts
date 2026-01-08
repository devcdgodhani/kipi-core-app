import { IOrder } from '../../types/order';
import { IPaymentAttributes } from '../../interfaces/payment';

/**
 * Common interface for all payment gateway implementations
 * This ensures consistent behavior across PhonePe, Razorpay, and Paytm
 */
export interface IPaymentGatewayService {
  /**
   * Creates a payment request with the gateway
   * @param order - Order details
   * @param amount - Amount in smallest currency unit (paise for INR)
   * @param metadata - Additional metadata for the payment
   * @returns Payment initiation response with redirect URL or SDK data
   */
  createPayment(
    order: IOrder,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentInitResponse>;

  /**
   * Verifies payment after gateway callback/redirect
   * @param data - Gateway-specific verification data
   * @returns Verification result with payment status
   */
  verifyPayment(data: any): Promise<PaymentVerifyResponse>;

  /**
   * Initiates a refund for a payment
   * @param payment - Payment to refund
   * @param amount - Amount to refund (in smallest currency unit)
   * @param reason - Reason for refund
   * @returns Refund initiation response
   */
  refundPayment(
    payment: IPaymentAttributes,
    amount: number,
    reason?: string
  ): Promise<RefundResponse>;

  /**
   * Fetches current payment status from gateway
   * @param transactionId - Gateway transaction ID
   * @returns Current payment status
   */
  fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse>;

  /**
   * Verifies webhook signature from gateway
   * @param payload - Webhook payload
   * @param signature - Signature from webhook headers
   * @returns True if signature is valid
   */
  verifyWebhookSignature(payload: any, signature: string): boolean;
}

/**
 * Response from payment initiation
 */
export interface PaymentInitResponse {
  success: boolean;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  redirectUrl?: string;
  redirectMethod?: 'GET' | 'POST';
  // Razorpay specific (for SDK integration)
  razorpayOrderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Response from payment verification
 */
export interface PaymentVerifyResponse {
  success: boolean;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gatewayTransactionId?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  error?: string;
  errorCode?: string;
}

/**
 * Response from refund initiation
 */
export interface RefundResponse {
  success: boolean;
  gatewayRefundId?: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  error?: string;
  errorCode?: string;
}

/**
 * Response from payment status check
 */
export interface PaymentStatusResponse {
  success: boolean;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  gatewayTransactionId?: string;
  metadata?: Record<string, any>;
  error?: string;
}
