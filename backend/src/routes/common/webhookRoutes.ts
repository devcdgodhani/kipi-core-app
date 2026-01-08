import { Router } from 'express';
import PaymentWebhookController from '../../controllers/paymentWebhookController';
import WebhookValidators from '../../validators/webhookValidators';

const router = Router();
const webhookController = new PaymentWebhookController();
const validators = new WebhookValidators();

// Webhook routes (no auth - verified by signature)
router.post('/phonepe/payment', validators.phonePeWebhook, webhookController.handlePhonePeWebhook);
router.post('/razorpay/payment', validators.razorpayWebhook, webhookController.handleRazorpayWebhook);
router.post('/paytm/payment', validators.paytmWebhook, webhookController.handlePaytmWebhook);

export default router;
