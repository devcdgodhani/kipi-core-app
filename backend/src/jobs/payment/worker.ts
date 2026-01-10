import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IPaymentWebhookJobPayload } from '../types';
import { PAYMENT_GATEWAY } from '../../constants/payment';
import { WebhookHandlerService } from '../../services/concrete/webhookHandlerService';
import { PaymentService } from '../../services/concrete/paymentService';

/**
 * Payment Webhook Job Processor
 * Processes payment gateway webhooks (Razorpay, PhonePe, Paytm)
 */
const processPaymentWebhookJob = async (job: Job<IPaymentWebhookJobPayload>) => {
  const { provider, body, headers, receivedAt } = job.data;
  console.log(`[Payment Worker] Processing webhook for ${provider}, received at ${receivedAt}`);

  try {
    const handlerService = new WebhookHandlerService();
    const gatewayProvider = provider as PAYMENT_GATEWAY;

    // Process webhook (business logic + log update)
    const result = await handlerService.processWebhook(gatewayProvider, body, headers);

    if (result.success) {
      console.log(`[Payment Worker] Successfully processed ${provider} webhook`);
      return { success: true, jobId: job.id };
    } else {
      console.error(`[Payment Worker] Failed to process ${provider} webhook: ${result.message}`);
      
      // Don't retry for known non-retryable failures
      if (result.message.includes('not found') || result.message.includes('already processed')) {
        return { success: false, message: result.message };
      }
      
      throw new Error(result.message);
    }
  } catch (error: any) {
    console.error(`[Payment Worker] Error processing ${provider} webhook:`, error);
    throw error;
  }
};

/**
 * Payment Status Sync Job Processor
 * Syncs payment status from gateway
 */
const processPaymentSyncJob = async (job: Job<{ paymentId: string }>) => {
  const { paymentId } = job.data;
  console.log(`[Payment Worker] Syncing status for payment ${paymentId}`);

  try {
    const paymentService = new PaymentService();
    await paymentService.fetchPaymentStatus(paymentId);
    
    console.log(`[Payment Worker] Successfully synced status for payment ${paymentId}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Payment Worker] Error syncing payment ${paymentId}:`, error);
    throw error;
  }
};

/**
 * Unified Payment Processor
 * Routes jobs to appropriate handler based on job name
 */
const paymentProcessor = async (job: Job<IPaymentWebhookJobPayload | { paymentId: string }>) => {
  console.log(`[Payment Worker] Processing job ${job.id} of type ${job.name}`);

  switch (job.name) {
    case BULL_QUEUES.PAYMENT.JOBS.PROCESS_PAYMENT_WEBHOOK:
      return processPaymentWebhookJob(job as Job<IPaymentWebhookJobPayload>);
    
    case BULL_QUEUES.PAYMENT.JOBS.SYNC_PAYMENT_STATUS:
      return processPaymentSyncJob(job as Job<{ paymentId: string }>);
    
    default:
      console.error(`[Payment Worker] Unknown job type: ${job.name}`);
      throw new Error(`Unknown payment job type: ${job.name}`);
  }
};

/**
 * Setup Payment Workers
 * Initializes the unified payment worker
 */
export const setupPaymentWorkers = () => {
  QueueFactory.createWorker(BULL_QUEUES.PAYMENT.NAME, paymentProcessor);
  console.log('[Payment Worker] Payment worker started');
};
