import { WebhookLogModel } from '../../db/mongodb/models/webhookLogModel';
import { PaymentService } from './PaymentService';
import { PaymentRefundService } from './PaymentRefundService';
import { PaymentGatewayService } from './PaymentGatewayService';
import { IWebhookHandlerServiceContract } from '../contracts/IWebhookHandlerServiceContract';
import { PAYMENT_GATEWAY, WEBHOOK_EVENT_TYPE } from '../../constants/payment';
import { MongooseCommonService } from './mongooseCommonService';
import { IWebhookLogAttributes, IWebhookLogDocument } from '../../interfaces/webhookLog';

/**
 * Webhook Handler Service
 * Processes webhooks from payment gateways
 */
export class WebhookHandlerService 
  extends MongooseCommonService<IWebhookLogAttributes, IWebhookLogDocument> 
  implements IWebhookHandlerServiceContract {
  private paymentService: PaymentService;
  private refundService: PaymentRefundService;
  private gatewayService: PaymentGatewayService;

  constructor() {
    super(WebhookLogModel);
    this.paymentService = new PaymentService();
    this.refundService = new PaymentRefundService();
    this.gatewayService = new PaymentGatewayService();
  }

  /**
   * Generate unique event ID from webhook payload
   */
  private generateEventId(provider: string, payload: any): string {
    // Use gateway-specific transaction ID or generate one
    const txnId = payload.transactionId || payload.orderId || payload.id || Date.now();
    return `${provider}_${txnId}_${Date.now()}`;
  }

  /**
   * Determine event type from webhook payload
   */
  private determineEventType(provider: PAYMENT_GATEWAY, payload: any): string {
    switch (provider) {
      case PAYMENT_GATEWAY.PHONEPE:
        // Support both V1 (code) and V2 (state/event)
        const phonePeState = payload.state || payload.code || payload.payload?.state;
        const phonePeEvent = payload.event;

        if (phonePeState === 'COMPLETED' || phonePeState === 'SUCCESS' || phonePeEvent === 'checkout.order.completed') 
          return WEBHOOK_EVENT_TYPE.PAYMENT_SUCCESS;
        if (phonePeState === 'FAILED' || phonePeState === 'PAYMENT_ERROR' || phonePeEvent === 'checkout.order.failed') 
          return WEBHOOK_EVENT_TYPE.PAYMENT_FAILED;
        if (phonePeState === 'PENDING' || phonePeState === 'PAYMENT_PENDING') 
          return WEBHOOK_EVENT_TYPE.PAYMENT_PENDING;
        break;

      case PAYMENT_GATEWAY.RAZORPAY:
        if (payload.event === 'payment.captured') return WEBHOOK_EVENT_TYPE.PAYMENT_SUCCESS;
        if (payload.event === 'payment.failed') return WEBHOOK_EVENT_TYPE.PAYMENT_FAILED;
        if (payload.event === 'refund.created') return WEBHOOK_EVENT_TYPE.REFUND_PENDING;
        if (payload.event === 'refund.processed') return WEBHOOK_EVENT_TYPE.REFUND_SUCCESS;
        if (payload.event === 'refund.failed') return WEBHOOK_EVENT_TYPE.REFUND_FAILED;
        break;

      case PAYMENT_GATEWAY.PAYTM:
        if (payload.STATUS === 'TXN_SUCCESS') return WEBHOOK_EVENT_TYPE.PAYMENT_SUCCESS;
        if (payload.STATUS === 'TXN_FAILURE') return WEBHOOK_EVENT_TYPE.PAYMENT_FAILED;
        if (payload.STATUS === 'PENDING') return WEBHOOK_EVENT_TYPE.PAYMENT_PENDING;
        break;
    }

    return 'UNKNOWN';
  }

  /**
   * Validates and logs initial webhook reception
   */
  async validateAndLog(
    provider: PAYMENT_GATEWAY,
    payload: any,
    headers: Record<string, string>,
    signature: string
  ): Promise<{ isValid: boolean; logId?: string }> {
    const eventId = this.generateEventId(provider, payload);

    try {
      // 1. Verify webhook signature
      const isValid = await this.gatewayService.verifyWebhook(provider, payload, signature);
      if (!isValid) {
        return { isValid: false };
      }

      // 2. Check for duplicate webhook
      const existingLog = await WebhookLogModel.findOne({ eventId });
      if (existingLog) {
        return { isValid: true, logId: existingLog._id.toString() };
      }

      // 3. Create initial webhook log
      const webhookLog = await WebhookLogModel.create({
        eventId,
        provider,
        eventType: this.determineEventType(provider, payload),
        payload,
        headers,
        status: 'PENDING',
        retryCount: 0
      });

      return { isValid: true, logId: webhookLog._id.toString() };
    } catch (error) {
      console.error('Webhook validateAndLog error:', error);
      return { isValid: false };
    }
  }

  /**
   * Process webhook from payment gateway (Main entry point for workers)
   */
  async processWebhook(
    provider: PAYMENT_GATEWAY,
    payload: any,
    headers: Record<string, string>,
    signature?: string // Optional if already validated
  ): Promise<{ success: boolean; message: string }> {
    const startTime = Date.now();
    const eventId = this.generateEventId(provider, payload);

    try {
      // Find existing log or create one
      let webhookLog = await WebhookLogModel.findOne({ eventId });
      
      if (!webhookLog) {
        webhookLog = await WebhookLogModel.create({
          eventId,
          provider,
          eventType: this.determineEventType(provider, payload),
          payload,
          headers,
          status: 'PROCESSING',
          retryCount: 0
        });
      } else {
        await WebhookLogModel.updateOne({ _id: webhookLog._id }, { $set: { status: 'PROCESSING' } });
      }

      // Verify signature if provided (and not already proven valid)
      if (signature) {
        const isValid = await this.gatewayService.verifyWebhook(provider, payload, signature);
        if (!isValid) {
           await WebhookLogModel.updateOne(
            { _id: webhookLog._id },
            { $set: { status: 'FAILED', error: 'Invalid signature', processingTime: Date.now() - startTime } }
          );
          return { success: false, message: 'Invalid signature' };
        }
      }

      // Process business logic based on event type
      const eventType = this.determineEventType(provider, payload);
      let result;

      if (eventType.startsWith('payment.')) {
        result = await this.handlePaymentWebhook(provider, payload);
      } else if (eventType.startsWith('refund.')) {
        result = await this.handleRefundWebhook(provider, payload);
      } else {
        result = { success: false, message: 'Unknown event type' };
      }

      // Update final log status
      await WebhookLogModel.updateOne(
        { _id: webhookLog._id },
        {
          $set: {
            status: result.success ? 'SUCCESS' : 'FAILED',
            processedAt: new Date(),
            processingTime: Date.now() - startTime,
            error: result.success ? undefined : result.message
          }
        }
      );

      return result;
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      await WebhookLogModel.updateOne(
        { eventId },
        {
          $set: {
            status: 'FAILED',
            error: error.message,
            errorStack: error.stack,
            processingTime: Date.now() - startTime
          }
        }
      );
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle payment-related webhook
   */
  private async handlePaymentWebhook(
    provider: PAYMENT_GATEWAY,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Extract payment identifier based on provider
      let paymentIdentifier: string;

      switch (provider) {
        case PAYMENT_GATEWAY.PHONEPE:
          // V2 uses merchantOrderId, V1 uses merchantTransactionId
          paymentIdentifier = payload.payload?.merchantOrderId || 
                              payload.merchantOrderId || 
                              payload.data?.merchantTransactionId || 
                              payload.transactionId;
          break;
        case PAYMENT_GATEWAY.RAZORPAY:
          paymentIdentifier = payload.payload?.payment?.entity?.order_id;
          break;
        case PAYMENT_GATEWAY.PAYTM:
          paymentIdentifier = payload.ORDERID;
          break;
        default:
          return { success: false, message: 'Unsupported provider' };
      }

      // Find payment by gateway transaction ID or order ID
      const payment = await this.paymentService.getPaymentByGatewayId(paymentIdentifier);
      if (!payment) {
        console.error(`[WebhookHandlerService] Payment not found for identifier: ${paymentIdentifier}`);
        return { success: false, message: 'Payment not found' };
      }

      // Verify payment
      await this.paymentService.verifyPayment(payment._id.toString(), payload);

      return { success: true, message: 'Payment webhook processed successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle refund-related webhook
   */
  private async handleRefundWebhook(
    provider: PAYMENT_GATEWAY,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Extract refund identifier based on provider
      let refundIdentifier: string;
      let status: string;

      switch (provider) {
        case PAYMENT_GATEWAY.RAZORPAY:
          refundIdentifier = payload.payload?.refund?.entity?.id;
          status = payload.payload?.refund?.entity?.status;
          break;
        case PAYMENT_GATEWAY.PHONEPE:
          refundIdentifier = payload.data?.merchantRefundId;
          status = payload.code === 'REFUND_SUCCESS' ? 'SUCCESS' : 'FAILED';
          break;
        case PAYMENT_GATEWAY.PAYTM:
          refundIdentifier = payload.REFID;
          status = payload.REFUNDSTATUS;
          break;
        default:
          return { success: false, message: 'Unsupported provider' };
      }

      // Find refund by gateway refund ID
      const refund = await this.refundService.getRefundByNumber(refundIdentifier);
      if (!refund) {
        return { success: false, message: 'Refund not found' };
      }

      // Update refund status
      const refundStatus = status === 'SUCCESS' || status === 'processed' ? 'SUCCESS' : 'FAILED';
      await this.refundService.updateRefundStatus(
        refund._id.toString(),
        refundStatus as any,
        payload
      );

      return { success: true, message: 'Refund webhook processed successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(webhookLogId: string): Promise<{ success: boolean; message: string }> {
    const webhookLog = await WebhookLogModel.findById(webhookLogId);
    if (!webhookLog) {
      return { success: false, message: 'Webhook log not found' };
    }

    // Increment retry count
    await WebhookLogModel.updateOne(
      { _id: webhookLogId },
      { $inc: { retryCount: 1 } }
    );

    // Reprocess webhook
    return await this.processWebhook(
      webhookLog.provider.toLowerCase() as PAYMENT_GATEWAY,
      webhookLog.payload,
      webhookLog.headers,
      webhookLog.headers['x-webhook-signature'] || ''
    );
  }
}
