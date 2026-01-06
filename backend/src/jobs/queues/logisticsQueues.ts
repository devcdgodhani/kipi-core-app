import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';

export const QUEUE_NAMES = {
  WEBHOOK: 'logistics-webhook-queue',
  TRACKING: 'logistics-tracking-queue',
  NOTIFICATION: 'logistics-notification-queue',
};

class LogisticsQueues {
  private static instance: LogisticsQueues;
  
  public webhookQueue: Queue;
  public trackingQueue: Queue; 
  public notificationQueue: Queue;

  private constructor() {
    this.webhookQueue = QueueFactory.createQueue(QUEUE_NAMES.WEBHOOK);
    this.trackingQueue = QueueFactory.createQueue(QUEUE_NAMES.TRACKING);
    this.notificationQueue = QueueFactory.createQueue(QUEUE_NAMES.NOTIFICATION);
  }

  public static getInstance(): LogisticsQueues {
    if (!LogisticsQueues.instance) {
      LogisticsQueues.instance = new LogisticsQueues();
    }
    return LogisticsQueues.instance;
  }
}

export const logisticsQueues = LogisticsQueues.getInstance();
