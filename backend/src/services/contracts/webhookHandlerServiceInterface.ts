import { PAYMENT_GATEWAY } from '../../constants/payment';

/**
 * Webhook Handler Service Contract
 * Interface for processing payment gateway webhooks
 */
export interface IWebhookHandlerService {
  /**
   * Process webhook from payment gateway
   */
  processWebhook(
    provider: PAYMENT_GATEWAY,
    payload: any,
    headers: Record<string, string>,
    signature?: string,
    webhookLogId?: string
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Retry failed webhook
   */
  retryWebhook(webhookLogId: string): Promise<{ success: boolean; message: string }>;
}
