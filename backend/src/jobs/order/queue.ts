import { Queue } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';

/**
 * Order Queue Manager
 * Handles order-related background tasks (processing, invoice generation)
 */
class OrderQueueManager {
  private static instance: OrderQueueManager;
  
  public queue: Queue;

  private constructor() {
    this.queue = QueueFactory.createQueue(BULL_QUEUES.ORDER.NAME);
  }

  public static getInstance(): OrderQueueManager {
    if (!OrderQueueManager.instance) {
      OrderQueueManager.instance = new OrderQueueManager();
    }
    return OrderQueueManager.instance;
  }
}

export const orderQueue = OrderQueueManager.getInstance();
