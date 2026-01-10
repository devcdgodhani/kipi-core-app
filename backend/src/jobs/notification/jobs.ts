import { notificationQueue } from './queue';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IEmailJobPayload, IWhatsAppJobPayload } from '../types';

/**
 * Enqueue Email Job
 * Add an email notification to the queue
 */
export const enqueueEmailJob = async (payload: IEmailJobPayload) => {
  return notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

/**
 * Enqueue WhatsApp Job
 * Add a WhatsApp message to the queue
 */
export const enqueueWhatsAppJob = async (payload: IWhatsAppJobPayload) => {
  return notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, payload, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};
