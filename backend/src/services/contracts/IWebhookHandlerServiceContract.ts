import { PAYMENT_GATEWAY } from '../../constants/payment';

/**
 * Webhook Handler Service Contract
 * Interface for processing payment gateway webhooks
 */
export interface IWebhookHandlerServiceContract {
  /**
   * Process webhook from payment gateway
   */
  processWebhook(
    provider: PAYMENT_GATEWAY,
    payload: any,
    headers: Record<string, string>,
    signature: string
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Retry failed webhook
   */
  retryWebhook(webhookLogId: string): Promise<{ success: boolean; message: string }>;

  /**
   * Get webhook logs
   */
  getWebhookLogs(
    filters: {
      provider?: string;
      status?: string;
      eventType?: string;
    },
    limit?: number,
    skip?: number
  ): Promise<any[]>;
}
