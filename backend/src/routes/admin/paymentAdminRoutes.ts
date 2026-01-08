import { Router } from 'express';
import PaymentGatewayController from '../../controllers/paymentGatewayController';
import PaymentWebhookController from '../../controllers/paymentWebhookController';
import AdminPaymentValidators from '../../validators/adminPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const gatewayController = new PaymentGatewayController();
const webhookController = new PaymentWebhookController();
const validators = new AdminPaymentValidators();

// All admin routes require authentication
router.use(jwtAuth());

// Payment gateway management
router.get('/payment-gateways', validators.getAllGateways, gatewayController.getAllGateways);
router.post('/payment-gateways', validators.updateGateway, gatewayController.createGateway); // Reusing update validator for now
router.put('/payment-gateways/:name', validators.updateGateway, gatewayController.updateGateway);
router.patch('/payment-gateways/:name/toggle', validators.toggleGateway, gatewayController.toggleGateway);

// Webhook logs management
router.get('/webhooks/logs', validators.getWebhookLogs, webhookController.getWebhookLogs);
router.post('/webhooks/:id/retry', validators.retryWebhook, webhookController.retryWebhook);

export default router;
