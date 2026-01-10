import { logisticsQueue } from './queue';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IWebhookJobPayload, ITrackingSyncJobPayload } from '../types';

/**
 * Enqueue Webhook Job
 * Add a logistics webhook to the queue for processing
 */
export const enqueueWebhookJob = async (payload: IWebhookJobPayload) => {
  return logisticsQueue.queue.add(BULL_QUEUES.LOGISTICS.JOBS.PROCESS_WEBHOOK, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

/**
 * Enqueue Tracking Sync Job
 * Add a tracking sync task to the queue
 */
export const enqueueTrackingJob = async (payload: ITrackingSyncJobPayload) => {
  return logisticsQueue.queue.add(BULL_QUEUES.LOGISTICS.JOBS.SYNC_TRACKING, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};
