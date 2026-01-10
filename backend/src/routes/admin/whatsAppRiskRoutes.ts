import { Router } from 'express';
import WhatsAppRiskController from '../../controllers/whatsAppRiskController';
import WhatsAppRiskValidator from '../../validators/whatsAppRiskValidator';

const router = Router();
const controller = new WhatsAppRiskController();
const validator = new WhatsAppRiskValidator();

// Stats & Analysis
router.get('/average', controller.getGlobalRiskAverage);
router.get('/breakdown', controller.getRiskBreakdown);
router.get('/high-risk', validator.getHighRiskAccounts, controller.getHighRiskAccounts);
router.get('/recent-events', controller.getRecentRiskEvents);

// Specific Account Events
router.get('/events/:accountId', validator.getAccountRiskEvents, controller.getAccountRiskEvents);

// Log Event (Manual/System)
router.post('/log-event', validator.logRiskEvent, controller.logRiskEvent);

export default router;
