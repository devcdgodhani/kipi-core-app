import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { QUEUE_NAMES } from '../../jobs/queues/logisticsQueues';
import { ITrackingSyncJobPayload } from '../../jobs/types';
import { trackingService } from '../../services/concrete/trackingService';

const trackingProcessor = async (job: Job<ITrackingSyncJobPayload>) => {
  const { awb } = job.data;
  console.log(`Processing tracking sync job ${job.id} for AWB: ${awb}`);

  try {
    // Force sync from provider
    // We use the existing getTrackingByAWB which handles fetching from provider if needed.
    // However, we want to force a refresh usually in background jobs.
    // The current implementation of getTrackingByAWB has a cache check (1 hour).
    // If we want to force it, we might need a flag in getTrackingByAWB or a new method.
    // For now, calling getTrackingByAWB is safe as it updates if stale.
    
    await trackingService.getTrackingByAWB(awb);
    
    return Promise.resolve();
  } catch (error) {
    console.error(`Tracking sync failed for AWB ${awb}:`, error);
    return Promise.reject(error);
  }
};

export const setupTrackingWorker = () => {
  QueueFactory.createWorker(QUEUE_NAMES.TRACKING, trackingProcessor);
  console.log('Tracking worker started');
};
