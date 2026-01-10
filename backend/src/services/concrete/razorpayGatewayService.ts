import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentInitResponse,
  PaymentVerifyResponse,
  RefundResponse,
  PaymentStatusResponse
} from '../contracts/paymentGatewayInterface';
import { IOrderAttributes } from '../../interfaces';
import { IPaymentAttributes } from '../../interfaces/payment';
import { IRazorpayCredentials } from '../../types/payment';

/**
 * Razorpay Payment Gateway Service
 * Uses official Razorpay Node.js SDK
 */
export class RazorpayGatewayService implements IPaymentGateway {
  private razorpay: Razorpay;
  private credentials: IRazorpayCredentials;
  private webhookSecret: string;

  constructor(
    credentials: IRazorpayCredentials,
    webhookSecret: string
  ) {
    this.credentials = credentials;
    this.webhookSecret = webhookSecret;
    
    // Initialize Razorpay SDK
    this.razorpay = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret
    });
  }

  /**
   * Creates a Razorpay order
   */
  async createPayment(
    order: IOrderAttributes,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentInitResponse> {
    try {
      // Create Razorpay order
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: (order as any)._id?.toString() || order.userId.toString(),
          userId: order.userId.toString()
        }
      });

      // Razorpay uses SDK integration, not redirect
      // Return order details for frontend SDK
      return {
        success: true,
        gatewayOrderId: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        keyId: this.credentials.keyId,
        amount: razorpayOrder.amount as number,
        currency: razorpayOrder.currency
      };
    } catch (error: any) {
      console.error('Razorpay createPayment error:', error);
      return {
        success: false,
        error: error.error?.description || error.message || 'Payment initiation failed',
        errorCode: error.error?.code || 'RAZORPAY_ERROR'
      };
    }
  }

  /**
   * Verifies Razorpay payment signature
   */
  async verifyPayment(data: any): Promise<PaymentVerifyResponse> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', this.credentials.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return {
          success: false,
          status: 'FAILED',
          error: 'Invalid payment signature',
          errorCode: 'SIGNATURE_MISMATCH'
        };
      }

      // Fetch payment details from Razorpay
      const payment = await this.razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status === 'captured' || payment.status === 'authorized') {
        return {
          success: true,
          status: 'SUCCESS',
          gatewayTransactionId: razorpay_payment_id,
          paymentMethod: payment.method || 'UNKNOWN',
          metadata: {
            gatewayResponse: payment,
            email: payment.email,
            contact: payment.contact,
            vpa: payment.vpa,
            cardId: payment.card_id
          }
        };
      } else if (payment.status === 'failed') {
        return {
          success: false,
          status: 'FAILED',
          error: payment.error_description || 'Payment failed',
          errorCode: (payment.error_code as string) || undefined
        };
      } else {
        return {
          success: false,
          status: 'PENDING',
          gatewayTransactionId: razorpay_payment_id
        };
      }
    } catch (error: any) {
      console.error('Razorpay verifyPayment error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.error?.description || error.message || 'Payment verification failed',
        errorCode: error.error?.code || 'RAZORPAY_VERIFY_ERROR'
      };
    }
  }

  /**
   * Initiates refund with Razorpay
   */
  async refundPayment(
    payment: IPaymentAttributes,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const refund = await this.razorpay.payments.refund(payment.gatewayTransactionId!, {
        amount: amount * 100, // Amount in paise
        notes: {
          reason: reason || 'Customer request',
          paymentId: (payment as any)._id?.toString() || payment.internalPaymentId
        }
      });

      return {
        success: true,
        gatewayRefundId: refund.id,
        status: refund.status === 'processed' ? 'SUCCESS' : 'PENDING'
      };
    } catch (error: any) {
      console.error('Razorpay refundPayment error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.error?.description || error.message || 'Refund initiation failed',
        errorCode: error.error?.code || 'RAZORPAY_REFUND_ERROR'
      };
    }
  }

  /**
   * Fetches payment status from Razorpay
   */
  async fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const payment = await this.razorpay.payments.fetch(transactionId);

      let status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (payment.status === 'captured' || payment.status === 'authorized') {
        status = 'SUCCESS';
      } else if (payment.status === 'failed') {
        status = 'FAILED';
      } else if (payment.status === 'created') {
        status = 'INITIATED';
      }

      return {
        success: true,
        status,
        gatewayTransactionId: payment.id,
        metadata: payment
      };
    } catch (error: any) {
      console.error('Razorpay fetchPaymentStatus error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.error?.description || error.message || 'Status fetch failed'
      };
    }
  }

  /**
   * Fetches current refund status from Razorpay
   */
  async fetchRefundStatus(refundId: string): Promise<any> {
    try {
      const refund = await this.razorpay.refunds.fetch(refundId);
      
      return {
        success: true,
        status: refund.status === 'processed' ? 'SUCCESS' : 
                refund.status === 'failed' ? 'FAILED' : 'PENDING',
        gatewayRefundId: refund.id,
        metadata: refund
      };
    } catch (error: any) {
      console.error('Razorpay fetchRefundStatus error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.error?.description || error.message || 'Refund status fetch failed'
      };
    }
  }

  /**
   * Verifies Razorpay webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('Razorpay webhook signature verification error:', error);
      return false;
    }
  }
}
