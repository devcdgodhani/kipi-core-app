import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';

/**
 * Payment Queue Manager
 * Handles payment-related background tasks (webhooks, status sync)
 */
class PaymentQueueManager {
  private static instance: PaymentQueueManager;
  
  public queue: Queue;

  private constructor() {
    this.queue = QueueFactory.createQueue(BULL_QUEUES.PAYMENT.NAME);
  }

  public static getInstance(): PaymentQueueManager {
    if (!PaymentQueueManager.instance) {
      PaymentQueueManager.instance = new PaymentQueueManager();
    }
    return PaymentQueueManager.instance;
  }
}

export const paymentQueue = PaymentQueueManager.getInstance();
