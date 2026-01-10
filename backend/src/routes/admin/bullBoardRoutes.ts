import { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { notificationQueue } from '../../jobs/notification/queue';
import { logisticsQueue } from '../../jobs/logistics/queue';
import { paymentQueue } from '../../jobs/payment/queue';

const router = Router();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/admin/queues-dashboard');

// Register all queues with Bull Board
const queues = [
  // Notification queues
  new BullMQAdapter(notificationQueue.queue),
  
  // Logistics queue (Unified)
  new BullMQAdapter(logisticsQueue.queue),
  
  // Payment queue (Unified)
  new BullMQAdapter(paymentQueue.queue),
];

createBullBoard({
  queues,
  serverAdapter: serverAdapter,
});

router.use('/', serverAdapter.getRouter());

export default router;
