import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';

/**
 * Notification Queue
 * Handles all notification delivery (Email + WhatsApp)
 */
class NotificationQueueManager {
  private static instance: NotificationQueueManager;
  public queue: Queue;

  private constructor() {
    this.queue = QueueFactory.createQueue(BULL_QUEUES.NOTIFICATION.NAME);
  }

  public static getInstance(): NotificationQueueManager {
    if (!NotificationQueueManager.instance) {
      NotificationQueueManager.instance = new NotificationQueueManager();
    }
    return NotificationQueueManager.instance;
  }
}

export const notificationQueue = NotificationQueueManager.getInstance();
