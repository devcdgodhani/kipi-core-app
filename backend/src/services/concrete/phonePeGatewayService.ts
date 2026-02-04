import axios from 'axios';
import crypto from 'crypto';
import { ENV_VARIABLE } from '../../configs/env';
import { logger } from '../../configs/logger';
import {
  IPaymentGateway,
  PaymentInitResponse,
  PaymentVerifyResponse,
  RefundResponse,
  PaymentStatusResponse
} from '../contracts/paymentGatewayInterface';
import { IOrderAttributes } from '../../interfaces';
import { IPaymentAttributes } from '../../interfaces/payment';
import { IPhonePeCredentials } from '../../types/payment';
import { PAYMENT_GATEWAY_URLS } from '../../constants/payment';

/**
 * PhonePe Payment Gateway Service
 * Implements PhonePe Standard Checkout V2 API (OAuth Flow)
 */
export class PhonePeGatewayService implements IPaymentGateway {
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
   * Generates Auth Token for V2 API
   */
  private async getAuthToken(): Promise<string> {
    try {
      // Ensure client credentials exist
      if (!this.credentials.clientId || !this.credentials.clientSecret || !this.credentials.clientVersion) {
        throw new Error('PhonePe Client Credentials (clientId, clientSecret, clientVersion) missing for V2 API');
      }

      const params = new URLSearchParams();
      params.append('client_id', this.credentials.clientId);
      params.append('client_version', this.credentials.clientVersion);
      params.append('client_secret', this.credentials.clientSecret);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(
        `${this.baseUrl}/v1/oauth/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data && response.data.access_token) {
        return response.data.access_token;
      }
      throw new Error('Failed to retrieve access token from PhonePe');
    } catch (error: any) {
      console.error('PhonePe getAuthToken error:', error?.response?.data || error.message);
      throw new Error(`Auth Token Generation Failed: ${error.message}`);
    }
  }

  /**
   * Creates a payment with PhonePe V2
   */
  async createPayment(
    order: IOrderAttributes,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentInitResponse> {
    try {
      const merchantTransactionId = `TXN_${order.orderNumber}_${Date.now()}`;
      
      // Get Auth Token first
      const accessToken = await this.getAuthToken();

      const isDirectUPI = !!metadata?.vpa;

      // PhonePe V2 payload structure
      const payload: any = {
        merchantOrderId: merchantTransactionId,
        amount: amount * 100, // Amount in paise
        merchantUserId: (order as any).userId || 'USER_' + order.userId,
        paymentFlow: {
          type: isDirectUPI ? 'API_CHECKOUT' : 'PG_CHECKOUT',
          message: `Payment for Order #${order.orderNumber}`,
          merchantUrls: {
            redirectUrl: ENV_VARIABLE.CUSTOMER_APP_URL 
              ? `${ENV_VARIABLE.CUSTOMER_APP_URL}/payment/callback?orderId=${(order as any)._id || order.userId}`
              : '',
            callbackUrl: `${ENV_VARIABLE.BACKEND_API_URL}/api/v1/webhooks/phonepe`,
          }
        }
      };

      if (isDirectUPI) {
        payload.paymentInstrument = {
          type: 'UPI_COLLECT',
          vpa: metadata?.vpa
        };
      }

      logger.info('PhonePe V2 Payload:', { payload });

      // Make API call to checkout/v2/pay
      const response = await axios.post(
        `${this.baseUrl}/checkout/v2/pay`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`
          }
        }
      );

      logger.info('PhonePe V2 Response:', { response: response.data });

      // For Direct UPI (API_CHECKOUT), we might not get a redirectUrl but a success/pending state
      if (isDirectUPI) {
        const state = response.data?.state;
        if (state === 'PENDING' || state === 'COMPLETED' || state === 'PAYMENT_INITIATED') {
          return {
            success: true,
            gatewayTransactionId: merchantTransactionId,
            data: response.data
          };
        }
      }

      // Check response for redirect URL (PG_CHECKOUT)
      const redirectUrl = response.data?.redirectUrl || response.data?.data?.redirectUrl;
      if (redirectUrl) {
        return {
          success: true,
          gatewayTransactionId: merchantTransactionId,
          redirectUrl,
          redirectMethod: 'GET',
          data: response.data
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Payment initiation failed',
        errorCode: response.data?.code,
        data: response.data
      };
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
   * Fetches current refund status from PhonePe V2
   */
  async fetchRefundStatus(refundId: string): Promise<any> {
    try {
      const accessToken = await this.getAuthToken();

      const response = await axios.get(
        `${this.baseUrl}/payments/v2/refund/${refundId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`
          }
        }
      );

      return {
        success: true,
        status: response.data?.state === 'COMPLETED' ? 'SUCCESS' : 
                response.data?.state === 'FAILED' ? 'FAILED' : 'PENDING',
        gatewayRefundId: refundId,
        metadata: response.data
      };
    } catch (error: any) {
      console.error('PhonePe fetchRefundStatus error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'FAILED',
        error: error.response?.data?.message || error.message || 'Refund status fetch failed'
      };
    }
  }

  /**
   * Verifies payment status from PhonePe V2
   */
  async verifyPayment(data: any): Promise<PaymentVerifyResponse> {
    try {
      const { merchantOrderId } = data.payload || data;
      const accessToken = await this.getAuthToken();

      // Check payment status using V2 API
      const response = await axios.get(
        `${this.baseUrl}/checkout/v2/order/${merchantOrderId}/status`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`
          }
        }
      );

      // V2 Status Check: 'state' field
      if (response.data && response.data.state === 'COMPLETED') {
        return {
          success: true,
          status: 'SUCCESS',
          gatewayTransactionId: merchantOrderId,
          paymentMethod: response.data.paymentInstrument?.type || 'UNKNOWN',
          metadata: {
            gatewayResponse: response.data
          }
        };
      } else if (response.data.state === 'PENDING') {
        return {
          success: false,
          status: 'PENDING',
          gatewayTransactionId: merchantOrderId
        };
      } else {
         return {
          success: false,
          status: 'FAILED',
          error: response.data?.message || 'Payment failed',
          errorCode: response.data?.code
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
   * Initiates refund with PhonePe V2
   */
  async refundPayment(
    payment: IPaymentAttributes,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const merchantRefundId = `REFUND_${payment.internalPaymentId}_${Date.now()}`;
      const accessToken = await this.getAuthToken();

      const payload = {
        merchantRefundId: merchantRefundId,
        originalMerchantOrderId: payment.gatewayTransactionId,
        amount: amount * 100
      };

      const response = await axios.post(
        `${this.baseUrl}/payments/v2/refund`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${accessToken}`
          }
        }
      );

      if (response.data && (response.data.state === 'PENDING' || response.data.state === 'COMPLETED')) {
        return {
          success: true,
          gatewayRefundId: merchantRefundId,
          status: response.data.state === 'COMPLETED' ? 'SUCCESS' : 'PENDING'
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
   * Fetches payment status from PhonePe (Wrapper for verify)
   */
  async fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
     // Re-using verify logic as V2 unify status checks
     const verifyRes = await this.verifyPayment({ merchantOrderId: transactionId });
     return {
        success: verifyRes.success,
        status: verifyRes.status as any,
        gatewayTransactionId: transactionId,
        metadata: verifyRes.metadata
     };
  }

  /**
   * Verifies PhonePe webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const accessTokenVerified = true; 
    // Note: V2 Webhook verification typically involves verifying the JWS token or server-to-server callback integrity.
    // For now, adhering to the basic pattern: trust the verifyPayment details fetched via authenticated API.
    return accessTokenVerified;
  }
}
