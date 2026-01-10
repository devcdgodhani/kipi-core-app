import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IWebhookJobPayload, ITrackingSyncJobPayload } from '../types';
import { webhookService } from '../../services/concrete/webhookService';
import { trackingService } from '../../services/concrete/trackingService';

/**
 * Webhook Job Processor
 * Processes logistics webhooks from providers like Shiprocket
 */
const processWebhookJob = async (job: Job<IWebhookJobPayload>) => {
  const { provider, body } = job.data;
  console.log(`[Logistics Worker] Processing webhook job ${job.id} for ${provider}`);

  try {
    // Process the normalized webhook event
    // The controller should queue the normalized event in job.data.body
    await webhookService.processEvent(body);

    console.log(`[Logistics Worker] Webhook processed successfully`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Logistics Worker] Webhook processing failed:`, error);
    throw error;
  }
};

/**
 * Tracking Sync Job Processor
 * Syncs shipment tracking updates from courier providers
 */
const processTrackingJob = async (job: Job<ITrackingSyncJobPayload>) => {
  const { awb } = job.data;
  console.log(`[Logistics Worker] Processing tracking sync job ${job.id} for AWB: ${awb}`);

  try {
    // Force sync tracking data from provider
    await trackingService.getTrackingByAWB(awb);

    console.log(`[Logistics Worker] Tracking synced successfully for AWB: ${awb}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Logistics Worker] Tracking sync failed for AWB ${awb}:`, error);
    throw error;
  }
};

/**
 * Unified Logistics Processor
 * Routes jobs to appropriate handler based on job name
 */
const logisticsProcessor = async (job: Job<IWebhookJobPayload | ITrackingSyncJobPayload>) => {
  console.log(`[Logistics Worker] Processing job ${job.id} of type ${job.name}`);

  switch (job.name) {
    case BULL_QUEUES.LOGISTICS.JOBS.PROCESS_WEBHOOK:
      return processWebhookJob(job as Job<IWebhookJobPayload>);
    
    case BULL_QUEUES.LOGISTICS.JOBS.SYNC_TRACKING:
      return processTrackingJob(job as Job<ITrackingSyncJobPayload>);
    
    default:
      console.error(`[Logistics Worker] Unknown job type: ${job.name}`);
      throw new Error(`Unknown logistics job type: ${job.name}`);
  }
};

/**
 * Setup Logistics Workers
 * Initializes the unified logistics worker
 */
export const setupLogisticsWorkers = () => {
  QueueFactory.createWorker(BULL_QUEUES.LOGISTICS.NAME, logisticsProcessor);
  console.log('[Logistics Worker] Logistics worker started');
};
