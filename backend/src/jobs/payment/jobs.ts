import { paymentQueue } from './queue';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IPaymentWebhookJobPayload } from '../types';

/**
 * Enqueue Payment Webhook Job
 * Add a payment webhook to the queue for processing
 */
export const enqueuePaymentWebhookJob = async (payload: IPaymentWebhookJobPayload) => {
  return paymentQueue.queue.add(BULL_QUEUES.PAYMENT.JOBS.PROCESS_PAYMENT_WEBHOOK, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

/**
 * Enqueue Payment Sync Job
 * Add a payment status sync task to the queue
 */
export const enqueuePaymentSyncJob = async (paymentId: string) => {
  return paymentQueue.queue.add(BULL_QUEUES.PAYMENT.JOBS.SYNC_PAYMENT_STATUS, { paymentId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};
