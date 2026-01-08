import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';

export const PAYMENT_QUEUE_NAMES = {
  WEBHOOK: 'payment-webhook-queue',
  SYNC: 'payment-status-sync-queue',
};

class PaymentQueues {
  private static instance: PaymentQueues;
  
  public webhookQueue: Queue;
  public syncQueue: Queue;

  private constructor() {
    this.webhookQueue = QueueFactory.createQueue(PAYMENT_QUEUE_NAMES.WEBHOOK);
    this.syncQueue = QueueFactory.createQueue(PAYMENT_QUEUE_NAMES.SYNC);
  }

  public static getInstance(): PaymentQueues {
    if (!PaymentQueues.instance) {
      PaymentQueues.instance = new PaymentQueues();
    }
    return PaymentQueues.instance;
  }
}

export const paymentQueues = PaymentQueues.getInstance();
