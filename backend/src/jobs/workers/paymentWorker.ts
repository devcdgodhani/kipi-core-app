import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { PAYMENT_QUEUE_NAMES } from '../../jobs/queues/paymentQueues';
import { IPaymentWebhookJobPayload } from '../../jobs/types';
import { PAYMENT_GATEWAY } from '../../constants/payment';

/**
 * Processor for payment webhooks
 * Uses WebhookHandlerService to ensure logs are updated and data is synced
 */
const paymentWebhookProcessor = async (job: Job<IPaymentWebhookJobPayload>) => {
    const { provider, body, headers, receivedAt } = job.data;
    console.log(`[PaymentWorker] Processing webhook for ${provider}, received at ${receivedAt}`);

    try {
        const { WebhookHandlerService } = await import('../../services/concrete/WebhookHandlerService');
        const handlerService = new WebhookHandlerService();

        // Map provider string to PAYMENT_GATEWAY enum
        const gatewayProvider = provider as PAYMENT_GATEWAY;

        // Process webhook (Business logic + Log update)
        const result = await handlerService.processWebhook(gatewayProvider, body, headers);

        if (result.success) {
            console.log(`[PaymentWorker] Successfully processed ${provider} webhook`);
        } else {
            console.error(`[PaymentWorker] Failed to process ${provider} webhook: ${result.message}`);
            // We might not want to throw here if it's a known failure (e.g. payment already processed)
            // But if it's a retryable error, we should throw.
            if (result.message.includes('not found') || result.message.includes('already processed')) {
                return; 
            }
            throw new Error(result.message);
        }
    } catch (error: any) {
        console.error(`[PaymentWorker] Error processing ${provider} webhook:`, error);
        throw error; // Rethrow to trigger BullMQ retry
    }
};

/**
 * Processor for payment status synchronization
 */
const paymentSyncProcessor = async (job: Job<{ paymentId: string }>) => {
    const { paymentId } = job.data;
    console.log(`[PaymentWorker] Syncing status for payment ${paymentId}`);

    try {
        const { PaymentService } = await import('../../services/concrete/PaymentService');
        const paymentService = new PaymentService();
        await paymentService.fetchPaymentStatus(paymentId);
        console.log(`[PaymentWorker] Successfully synced status for payment ${paymentId}`);
    } catch (error) {
        console.error(`[PaymentWorker] Error syncing payment ${paymentId}:`, error);
        throw error;
    }
};

export const setupPaymentWorkers = () => {
    QueueFactory.createWorker(PAYMENT_QUEUE_NAMES.WEBHOOK, paymentWebhookProcessor);
    QueueFactory.createWorker(PAYMENT_QUEUE_NAMES.SYNC, paymentSyncProcessor);
    console.log('✅ Payment workers initialized');
};
