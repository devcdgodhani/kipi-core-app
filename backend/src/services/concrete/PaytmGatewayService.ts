import crypto from 'crypto';
import axios from 'axios';
import {
  IPaymentGatewayService,
  PaymentInitResponse,
  PaymentVerifyResponse,
  RefundResponse,
  PaymentStatusResponse
} from '../contracts/PaymentGatewayInterface';
import { IOrder } from '../../types/order';
import { IPaymentAttributes } from '../../interfaces/payment';
import { IPaytmCredentials } from '../../types/payment';
import { PAYMENT_GATEWAY_URLS } from '../../constants/payment';

/**
 * Paytm Payment Gateway Service
 * Implements Paytm's payment gateway integration
 */
export class PaytmGatewayService implements IPaymentGatewayService {
  private credentials: IPaytmCredentials;
  private webhookSecret: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor(
    credentials: IPaytmCredentials,
    webhookSecret: string,
    environment: 'sandbox' | 'production' = 'sandbox'
  ) {
    this.credentials = credentials;
    this.webhookSecret = webhookSecret;
    this.environment = environment;
    this.baseUrl =
      environment === 'production'
        ? PAYMENT_GATEWAY_URLS.PAYTM.PRODUCTION
        : PAYMENT_GATEWAY_URLS.PAYTM.SANDBOX;
  }

  /**
   * Generate checksum for Paytm API requests
   */
  private generateChecksum(params: Record<string, any>): string {
    const paramStr = JSON.stringify(params);
    const checksum = crypto
      .createHmac('sha256', this.credentials.merchantKey)
      .update(paramStr)
      .digest('base64');
    return checksum;
  }

  /**
   * Verify checksum from Paytm response
   */
  private verifyChecksum(params: Record<string, any>, checksum: string): boolean {
    const { CHECKSUMHASH, ...paramsWithoutChecksum } = params;
    const generatedChecksum = this.generateChecksum(paramsWithoutChecksum);
    return generatedChecksum === checksum;
  }

  /**
   * Initiates payment with Paytm
   */
  async createPayment(
    order: IOrder,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<PaymentInitResponse> {
    try {
      const callbackUrl = metadata?.callbackUrl || '';
      const orderId = (order as any)._id?.toString() || order.userId.toString();
      const gatewayOrderId = `ORD_${Date.now()}_${orderId}`; // Paytm needs unique orderId per attempt

      const paytmParams = {
        body: {
          requestType: 'Payment',
          mid: this.credentials.merchantId,
          websiteName: this.credentials.website,
          txnAmount: {
            value: (amount / 100).toFixed(2),
            currency: 'INR'
          },
          userInfo: {
            custId: order.userId.toString()
          },
          callbackUrl: callbackUrl
        },
        head: {
          signature: ''
        }
      };

      // Generate signature
      paytmParams.head.signature = this.generateChecksum(paytmParams.body);

      const response = await axios.post(
        `${this.baseUrl}/theia/api/v1/initiateTransaction?mid=${this.credentials.merchantId}&orderId=${gatewayOrderId}`,
        paytmParams,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.body.resultInfo.resultStatus === 'S') {
        return {
          success: true,
          gatewayTransactionId: gatewayOrderId,
          gatewayOrderId: gatewayOrderId,
          redirectUrl: `${this.baseUrl}/theia/api/v1/showPaymentPage?mid=${this.credentials.merchantId}&orderId=${gatewayOrderId}`,
          redirectMethod: 'POST',
          data: {
            txnToken: response.data.body.txnToken,
            orderId: gatewayOrderId,
            amount: amount,
            mid: this.credentials.merchantId
          }
        };
      } else {
        return {
          success: false,
          error: response.data.body.resultInfo.resultMsg,
          errorCode: response.data.body.resultInfo.resultCode
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to initiate Paytm payment',
        errorCode: 'PAYTM_INIT_ERROR'
      };
    }
  }

  /**
   * Verifies payment after callback
   */
  async verifyPayment(data: any): Promise<PaymentVerifyResponse> {
    try {
      const { ORDERID, CHECKSUMHASH, ...params } = data;

      // Verify checksum
      if (!this.verifyChecksum(data, CHECKSUMHASH)) {
        return {
          success: false,
          status: 'FAILED',
          error: 'Invalid checksum',
          errorCode: 'CHECKSUM_MISMATCH'
        };
      }

      // Fetch transaction status
      const statusResponse = await this.fetchPaymentStatus(ORDERID);

      if (statusResponse.success && statusResponse.status === 'SUCCESS') {
        return {
          success: true,
          status: 'SUCCESS',
          gatewayTransactionId: ORDERID,
          paymentMethod: (statusResponse as any).paymentMode || 'PAYTM',
          metadata: {
            gatewayResponse: (statusResponse as any).data,
            amount: (statusResponse as any).amount
          }
        };
      } else {
        return {
          success: false,
          status: statusResponse.status === 'INITIATED' ? 'PENDING' : (statusResponse.status || 'FAILED'),
          gatewayTransactionId: ORDERID,
          error: statusResponse.error || 'Payment verification failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Payment verification failed',
        errorCode: 'PAYTM_VERIFY_ERROR'
      };
    }
  }

  /**
   * Initiates refund with Paytm
   */
  async refundPayment(
    payment: IPaymentAttributes,
    amount: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const refundId = `REFUND_${Date.now()}_${payment.internalPaymentId}`;

      const paytmParams = {
        body: {
          mid: this.credentials.merchantId,
          txnType: 'REFUND',
          orderId: payment.gatewayOrderId || payment.gatewayTransactionId,
          txnId: payment.gatewayTransactionId,
          refId: refundId,
          refundAmount: (amount / 100).toFixed(2)
        },
        head: {
          signature: ''
        }
      };

      paytmParams.head.signature = this.generateChecksum(paytmParams.body);

      const response = await axios.post(
        `${this.baseUrl}/refund/api/v1/async/refund`,
        paytmParams,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.body.resultInfo.resultStatus === 'PENDING' || 
          response.data.body.resultInfo.resultStatus === 'TXN_SUCCESS') {
        return {
          success: true,
          gatewayRefundId: refundId,
          status: 'PENDING'
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: response.data.body.resultInfo.resultMsg,
          errorCode: response.data.body.resultInfo.resultCode
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Refund initiation failed',
        errorCode: 'PAYTM_REFUND_ERROR'
      };
    }
  }

  /**
   * Fetches payment status from Paytm
   */
  async fetchPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const paytmParams = {
        body: {
          mid: this.credentials.merchantId,
          orderId: transactionId
        },
        head: {
          signature: ''
        }
      };

      paytmParams.head.signature = this.generateChecksum(paytmParams.body);

      const response = await axios.post(
        `${this.baseUrl}/merchant-status/api/v1/getPaymentStatus`,
        paytmParams,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const resultInfo = response.data.body.resultInfo;
      const txnInfo = response.data.body;

      if (resultInfo.resultStatus === 'TXN_SUCCESS') {
        return {
          success: true,
          status: 'SUCCESS',
          gatewayTransactionId: transactionId,
          metadata: {
            ...response.data.body,
            amount: txnInfo.txnAmount,
            paymentMode: txnInfo.paymentMode
          }
        };
      } else if (resultInfo.resultStatus === 'TXN_FAILURE') {
        return {
          success: false,
          status: 'FAILED',
          gatewayTransactionId: transactionId,
          error: resultInfo.resultMsg
        };
      } else {
        return {
          success: true,
          status: 'PENDING',
          gatewayTransactionId: transactionId,
          metadata: response.data.body
        };
      }
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Failed to fetch payment status'
      };
    }
  }

  /**
   * Fetches current refund status from Paytm
   */
  async fetchRefundStatus(refundId: string): Promise<any> {
    try {
      const paytmParams = {
        body: {
          mid: this.credentials.merchantId,
          orderId: refundId, // Usually merchantRefundId or refId
          refId: refundId
        },
        head: {
          signature: ''
        }
      };

      paytmParams.head.signature = this.generateChecksum(paytmParams.body);

      const response = await axios.post(
        `${this.baseUrl}/refund/api/v1/refundStatus`,
        paytmParams,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const resultStatus = response.data?.body?.resultInfo?.resultStatus;
      return {
        success: true,
        status: resultStatus === 'TXN_SUCCESS' ? 'SUCCESS' : 
                resultStatus === 'TXN_FAILURE' ? 'FAILED' : 'PENDING',
        gatewayRefundId: refundId,
        metadata: response.data?.body
      };
    } catch (error: any) {
      console.error('Paytm fetchRefundStatus error:', error);
      return {
        success: false,
        status: 'FAILED',
        error: error.message || 'Failed to fetch refund status'
      };
    }
  }

  /**
   * Verifies webhook signature from Paytm
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const { CHECKSUMHASH, ...params } = payload;
      return this.verifyChecksum(payload, CHECKSUMHASH || signature);
    } catch (error) {
      return false;
    }
  }
}
