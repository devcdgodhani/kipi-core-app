import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { webhookService } from '../../services/concrete/webhookService';
import { logisticsService } from '../../services/concrete/logisticsService';

/**
 * Logistics Queue Worker
 * Processes background jobs for logistics operations
 */
export const setupLogisticsWorkers = () => {
    QueueFactory.createWorker(BULL_QUEUES.LOGISTICS.NAME, async (job: Job) => {
        console.log(`LogisticsWorker: Processing job ${job.name} with ID ${job.id}`);

        try {
            switch (job.name) {
                case BULL_QUEUES.LOGISTICS.JOBS.PUSH_TO_LOGISTICS:
                    await pushToLogistics(job.data);
                    break;
                case BULL_QUEUES.LOGISTICS.JOBS.SYNC_TRACKING:
                    await syncTracking(job.data);
                    break;
                case BULL_QUEUES.LOGISTICS.JOBS.PROCESS_WEBHOOK:
                    await processWebhook(job.data);
                    break;
                default:
                    console.warn(`LogisticsWorker: Unknown job type ${job.name}`);
            }
        } catch (error) {
            console.error(`LogisticsWorker: Job ${job.name} failed:`, error);
            throw error;
        }
    });
    console.log('[Logistics Worker] Logistics worker started');
};

async function pushToLogistics(data: { orderId: string }) {
    console.log('LogisticsWorker: Pushing order to logistics provider:', data.orderId);
    try {
        await logisticsService.createShipment(data.orderId);
        console.log('LogisticsWorker: Order successfully pushed to logistics:', data.orderId);
    } catch (error) {
        console.error('LogisticsWorker: Failed to push order to logistics:', error);
        throw error;
    }
}

async function syncTracking(data: { shipmentId: string }) {
    console.log('LogisticsWorker: Syncing tracking for shipment:', data.shipmentId);
    try {
        await logisticsService.syncTrackingStatus(data.shipmentId);
        console.log('LogisticsWorker: Tracking synced for shipment:', data.shipmentId);
    } catch (error) {
         console.error('LogisticsWorker: Failed to sync tracking:', error);
         throw error;
    }
}

async function processWebhook(data: any) {
    console.log('LogisticsWorker: Processing webhook data');
    try {
        // Assuming data contains the normalized body needed for processing
        if (data && data.body) {
             await webhookService.processEvent(data.body);
             console.log('LogisticsWorker: Webhook processed successfully');
        } else {
             console.warn('LogisticsWorker: Invalid webhook payload');
        }
    } catch (error) {
         console.error('LogisticsWorker: Failed to process webhook:', error);
         throw error;
    }
}
