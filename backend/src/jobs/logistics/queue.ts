import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';

/**
 * Logistics Queue Manager
 * Handles logistics-related background tasks (webhooks, tracking)
 */
class LogisticsQueueManager {
  private static instance: LogisticsQueueManager;
  
  public queue: Queue;

  private constructor() {
    this.queue = QueueFactory.createQueue(BULL_QUEUES.LOGISTICS.NAME);
  }

  public static getInstance(): LogisticsQueueManager {
    if (!LogisticsQueueManager.instance) {
      LogisticsQueueManager.instance = new LogisticsQueueManager();
    }
    return LogisticsQueueManager.instance;
  }
}

export const logisticsQueue = LogisticsQueueManager.getInstance();
