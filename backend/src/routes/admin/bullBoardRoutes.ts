import { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { logisticsQueues } from '../../jobs/queues/logisticsQueues';

const router = Router();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/v1/admin/queues-dashboard');

const queues = [
  new BullMQAdapter(logisticsQueues.whatsappQueue),
  new BullMQAdapter(logisticsQueues.notificationQueue),
  new BullMQAdapter(logisticsQueues.webhookQueue),
  new BullMQAdapter(logisticsQueues.trackingQueue),
];

createBullBoard({
  queues,
  serverAdapter: serverAdapter,
});

router.use('/', serverAdapter.getRouter());

export default router;
