import { Router } from 'express';
import { whatsAppSystemController } from '../../controllers/whatsAppSystemController';
import { whatsAppSystemValidator } from '../../validators/whatsAppSystemValidator';

const router = Router();

router.get('/queue-status', whatsAppSystemValidator.getQueueStatus, whatsAppSystemController.getQueueStatus);
router.post('/retry-failed', whatsAppSystemValidator.retryFailedJobs, whatsAppSystemController.retryFailedJobs);
router.post('/clean-queue', whatsAppSystemValidator.cleanQueue, whatsAppSystemController.cleanQueue);
router.post('/clear-queue', whatsAppSystemValidator.clearQueue, whatsAppSystemController.clearQueue);

router.post('/pause', whatsAppSystemValidator.pause, whatsAppSystemController.pause);
router.post('/resume', whatsAppSystemValidator.resume, whatsAppSystemController.resume);
router.post('/reset-counters', whatsAppSystemValidator.resetCounters, whatsAppSystemController.resetCounters);

router.get('/dashboard-stats', whatsAppSystemValidator.getDashboardStats, whatsAppSystemController.getDashboardStats);

export default router;
