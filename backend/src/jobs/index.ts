import { setupWebhookWorker } from './workers/webhookWorker';
import { setupTrackingWorker } from './workers/trackingWorker';
import { setupNotificationWorker } from './workers/notificationWorker';
import { setupPaymentWorkers } from './workers/paymentWorker';
import { setupWhatsAppWorker } from './workers/whatsAppWorker';

export const initWorkers = () => {
  console.log('Initializing Background Workers...');
  setupWebhookWorker();
  setupTrackingWorker();
  setupNotificationWorker();
  setupPaymentWorkers();
  setupWhatsAppWorker();
};
