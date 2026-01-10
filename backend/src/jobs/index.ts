import { setupNotificationWorker } from './notification/worker';
import { setupLogisticsWorkers } from './logistics/worker';
import { setupPaymentWorkers } from './payment/worker';
import { setupOrderWorker } from './order/worker';

/**
 * Initialize all background workers
 */
export const initWorkers = () => {
  console.log('🚀 Initializing Background Workers...');
  
  setupNotificationWorker();
  setupLogisticsWorkers();
  setupPaymentWorkers();
  setupOrderWorker();
  
  console.log('✅ All workers initialized successfully');
};
