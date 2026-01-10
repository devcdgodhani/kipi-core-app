/**
 * Bull Queue Configuration
 * Centralized queue names and job types organized by domain
 */

export const BULL_QUEUES = {
  NOTIFICATION: {
    NAME: 'notification-queue',
    JOBS: {
      SEND_EMAIL: 'send-email',
      SEND_WHATSAPP: 'send-whatsapp',
      SEND_PUSH_CAMPAIGN: 'send-push-campaign',
    },
  },
  LOGISTICS: {
    NAME: 'logistics-queue',
    JOBS: {
      PROCESS_WEBHOOK: 'process-logistics-webhook',
      SYNC_TRACKING: 'sync-logistics-tracking',
      PUSH_TO_LOGISTICS: 'push-to-logistics',
    },
  },
  ORDER: {
    NAME: 'order-queue',
    JOBS: {
      PROCESS_ORDER_PLACED: 'process-order-placed',
      GENERATE_INVOICE: 'generate-invoice',
    },
  },
  PAYMENT: {
    NAME: 'payment-queue',
    JOBS: {
      PROCESS_PAYMENT_WEBHOOK: 'process-payment-webhook',
      SYNC_PAYMENT_STATUS: 'sync-payment-status',
    },
  },
} as const;

// Type exports for TypeScript
export type QueueConfig = typeof BULL_QUEUES[keyof typeof BULL_QUEUES];
export type QueueName = QueueConfig['NAME'];
export type JobType = QueueConfig['JOBS'][keyof QueueConfig['JOBS']];
