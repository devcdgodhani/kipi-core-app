import { Router } from 'express';
import PaymentGatewayController from '../../controllers/paymentGatewayController';
import { WebhookController } from '../../controllers/webhookController';
import PaymentController from '../../controllers/paymentController';
import AdminPaymentValidators from '../../validators/adminPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const gatewayController = new PaymentGatewayController();
const webhookController = new WebhookController();
const paymentController = new PaymentController();
const validators = new AdminPaymentValidators();

// All admin routes require authentication
router.use(jwtAuth());

// Payment gateway management
router.get('/payment-gateways', validators.getAllGateways, gatewayController.getAllGateways);
router.post('/payment-gateways', validators.updateGateway, gatewayController.createGateway); // Reusing update validator for now
router.put('/payment-gateways/:name', validators.updateGateway, gatewayController.updateGateway);
router.patch('/payment-gateways/:name/toggle', validators.toggleGateway, gatewayController.toggleGateway);

// Webhook logs management
router.get('/webhooks/logs', validators.getWebhookLogs, webhookController.getWithPagination);
router.post('/webhooks/:id/retry', validators.retryWebhook, webhookController.retryWebhook);

// Payment status management
router.get('/payments/:id/status', validators.fetchPaymentStatus, paymentController.fetchPaymentStatus);

export default router;
