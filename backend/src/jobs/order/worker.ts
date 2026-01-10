import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { orderService } from '../../services/concrete/orderService';

/**
 * Order Queue Worker
 * Processes background jobs for orders
 */
export const setupOrderWorker = () => {
  QueueFactory.createWorker(BULL_QUEUES.ORDER.NAME, async (job: Job) => {
    console.log(`OrderWorker: Processing job ${job.name} with ID ${job.id}`);

    try {
      switch (job.name) {
        case BULL_QUEUES.ORDER.JOBS.PROCESS_ORDER_PLACED:
          await processOrderPlaced(job.data);
          break;
        case BULL_QUEUES.ORDER.JOBS.GENERATE_INVOICE:
          await generateInvoice(job.data);
          break;
        default:
          console.warn(`OrderWorker: Unknown job type ${job.name}`);
      }
    } catch (error) {
      console.error(`OrderWorker: Job ${job.name} failed:`, error);
      throw error;
    }
  });
  console.log('[Order Worker] Order worker started');
};

async function processOrderPlaced(data: { orderId: string, userId: string }) {
    console.log('OrderWorker: Processing Order Placed logic for:', data.orderId);
    try {
        await orderService.processPostOrderActions(data.orderId, data.userId);
        console.log('OrderWorker: Order Placed logic completed for:', data.orderId);
    } catch (error) {
        console.error('OrderWorker: Failed to process order actions:', error);
        throw error;
    }
}

async function generateInvoice(data: { orderId: string }) {
    console.log('OrderWorker: Generating Invoice for:', data.orderId);
    try {
        await orderService.generateInvoice(data.orderId);
        console.log('OrderWorker: Invoice generated for:', data.orderId);
    } catch (error) {
        console.error('OrderWorker: Failed to generate invoice:', error);
        throw error;
    }
}
