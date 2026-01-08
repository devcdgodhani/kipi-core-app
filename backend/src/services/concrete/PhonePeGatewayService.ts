import axios from 'axios';
import crypto from 'crypto';
import { ENV_VARIABLE } from '../../configs/env';
import {
  IPaymentGatewayService,
  PaymentInitResponse,
  PaymentVerifyResponse,
  RefundResponse,
  PaymentStatusResponse
} from '../contracts/PaymentGatewayInterface';
import { IOrder } from '../../types/order';
import { IPaymentAttributes } from '../../interfaces/payment';
import { IPhonePeCredentials } from '../../types/payment';
import { PAYMENT_GATEWAY_URLS } from '../../constants/payment';

/**
 * PhonePe Payment Gateway Service
 * Implements PhonePe Pay API v3
 */
export class PhonePeGatewayService implements IPaymentGatewayService {
  private credentials: IPhonePeCredentials;
  private webhookSecret: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor(
    credentials: IPhonePeCredentials,
    webhookSecret: string,
    environment: 'sandbox' | 'production' = 'sandbox'
  ) {
    this.credentials = credentials;
    this.webhookSecret = webhookSecret;
    this.environment = environment;
   this.baseUrl =
         environment === 'production'
           ? PAYMENT_GATEWAY_URLS.PHONEPE.PRODUCTION
           : PAYMENT_GATEWAY_URLS.PHONEPE.SANDBOX;
  }

  /**
   * Creates a payment with PhonePe
   */
  async createPayment(
    order: IOrder,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentInitResponse> {
    try {
      const merchantTransactionId = `TXN_${order.orderNumber}_${Date.now()}`;
      const merchantUserId = (order as any)._id?.toString() || order.userId.toString();

      // PhonePe payload
      const payload = {
        merchantId: this.credentials.merchantId,
        merchantTransactionId,
        merchantUserId,
        amount: amount, // Amount in paise
        redirectUrl: ENV_VARIABLE.CUSTOMER_APP_URL 
          ? `${ENV_VARIABLE.CUSTOMER_APP_URL}/payment/callback?orderId=${(order as any)._id || order.userId}`
          : '',
        redirectMode: 'REDIRECT',
        callbackUrl: `${ENV_VARIABLE.BACKEND_API_URL}/api/v1/webhook/phonepe`,
        mobileNumber: order.shippingAddress.mobile,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // Encode payload to base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Generate checksum: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
      const checksumString = base64Payload + '/pg/v1/pay' + this.credentials.saltKey;
      const checksum =
        crypto.createHash('sha256').update(checksumString).digest('hex') +
        '###' +
        this.credentials.saltIndex;

      // Make API call
      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );

      if (response.data.success) {
        return {
          success: true,
          gatewayTransactionId: merchantTransactionId,
          redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
          redirectMethod: 'GET'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Payment initiation failed',
          errorCode: response.data.code
        };
      }
    } catch (error: any) {
      console.error('PhonePe createPayment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment initiation failed',
        errorCode: error.response?.data?.code || 'PHONEPE_ERROR'
      };
    }
  }

  /**
   * Verifies payment status from PhonePe
   */
  async verifyPayment(data: any): Promise<PaymentVerifyResponse> {
    try {
      const { merchantTransactionId } = data;

      // Generate checksum for status check
      const checksumString =
        `/pg/v1/status/${this.credentials.merchantId}/${merchantTransactionId}` +
        this.credentials.saltKey;
      const checksum =
        crypto.createHash('sha256').update(checksumString).digest('hex') +
        '###' +
        this.credentials.saltIndex;

      // Check payment status
      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.credentials.merchantId}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': this.credentials.merchantId
          }
        }
      );

      if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
        return {
          success: true,
          status: 'SUCCESS',
          gatewayTransactionId: response.data.data.transactionId,
          paymentMethod: response.data.data.paymentInstrument?.type || 'UNKNOWN',
          metadata: {
            gatewayResponse: response.data.data
          }
        };
      } else if (response.data.code === 'PAYMENT_PENDING') {
        return {
          success: false,
          status: 'PENDING',
          gatewayTransactionId: merchantTransactionId
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: response.data.message || 'Payment failed',
          errorCode: response.data.code
        };
      }
    } catch (error: any) {
      console.error('PhonePe verifyPayment error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'FAILED',
        error: error.response?.data?.message || error.message || 'Payment verification failed',
        errorCode: error.response?.data?.code || 'PHONEPE_VERIFY_ERROR'
      };
    }
  }

  /**
   * Initiates refund with PhonePe
   */
  async refundPayment(
    payment: IPaymentAttributes,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const merchantTransactionId = `REFUND_${payment.internalPaymentId}_${Date.now()}`;

      const payload = {
        merchantId: this.credentials.merchantId,
        merchantUserId: payment.userId.toString(),
        originalTransactionId: payment.gatewayTransactionId,
        merchantTransactionId,
        amount: amount,
        callbackUrl: `${ENV_VARIABLE.BACKEND_API_URL}/api/v1/webhook/phonepe/refund`
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      const checksumString = base64Payload + '/pg/v1/refund' + this.credentials.saltKey;
      const checksum =
        crypto.createHash('sha256').update(checksumString).digest('hex') +
        '###' +
        this.credentials.saltIndex;

      const response = await axios.post(
        `${this.baseUrl}/pg/v1/refund`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );

      if (response.data.success) {
        return {
          success: true,
          gatewayRefundId: merchantTransactionId,
          status: 'PENDING'
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: response.data.message || 'Refund initiation failed',
          errorCode: response.data.code
        };
      }
    } catch (error: any) {
      console.error('PhonePe refundPayment error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'FAILED',
        error: error.response?.data?.message || error.message || 'Refund initiation failed',
        errorCode: error.response?.data?.code || 'PHONEPE_REFUND_ERROR'
      };
    }
  }

  /**
   * Fetches payment status from PhonePe
   */
  async fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const checksumString =
        `/pg/v1/status/${this.credentials.merchantId}/${transactionId}` +
        this.credentials.saltKey;
      const checksum =
        crypto.createHash('sha256').update(checksumString).digest('hex') +
        '###' +
        this.credentials.saltIndex;

      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.credentials.merchantId}/${transactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': this.credentials.merchantId
          }
        }
      );

      let status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (response.data.code === 'PAYMENT_SUCCESS') {
        status = 'SUCCESS';
      } else if (response.data.code === 'PAYMENT_ERROR' || response.data.code === 'PAYMENT_DECLINED') {
        status = 'FAILED';
      }

      return {
        success: true,
        status,
        gatewayTransactionId: response.data.data?.transactionId,
        metadata: response.data.data
      };
    } catch (error: any) {
      console.error('PhonePe fetchPaymentStatus error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'FAILED',
        error: error.response?.data?.message || error.message || 'Status fetch failed'
      };
    }
  }

  /**
   * Verifies PhonePe webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      // PhonePe sends base64 encoded payload in webhook
      // Signature format: SHA256(base64Payload + saltKey) + ### + saltIndex
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksumString = base64Payload + this.credentials.saltKey;
      const expectedChecksum =
        crypto.createHash('sha256').update(checksumString).digest('hex') +
        '###' +
        this.credentials.saltIndex;

      return signature === expectedChecksum;
    } catch (error) {
      console.error('PhonePe webhook signature verification error:', error);
      return false;
    }
  }
}
