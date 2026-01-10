import { Router } from 'express';
import { paymentGatewayController } from '../../controllers/paymentGatewayController';
import { webhookController } from '../../controllers/webhookController';
import { paymentController } from '../../controllers/paymentController';
import { adminPaymentValidator } from '../../validators/adminPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All admin routes require authentication
router.use(jwtAuth());

// Payment gateway management
router.get('/payment-gateways', adminPaymentValidator.getAllGateways, paymentGatewayController.getAllGateways);
router.post('/payment-gateways', adminPaymentValidator.updateGateway, paymentGatewayController.createGateway); // Reusing update validator for now
router.put('/payment-gateways/:name', adminPaymentValidator.updateGateway, paymentGatewayController.updateGateway);
router.patch('/payment-gateways/:name/toggle', adminPaymentValidator.toggleGateway, paymentGatewayController.toggleGateway);

// Webhook logs management
router.get('/webhooks/logs', adminPaymentValidator.getWebhookLogs, webhookController.getWithPagination);
router.post('/webhooks/:id/retry', adminPaymentValidator.retryWebhook, webhookController.retryWebhook);

// Payment status management
router.get('/payments/:id/status', adminPaymentValidator.fetchPaymentStatus, paymentController.fetchPaymentStatus);

export default router;
