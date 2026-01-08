import express from 'express';
import { WebhookController } from '../controllers/webhookController';
import WebhookValidators from '../validators/webhookValidators';

const router = express.Router();
const webhookController = new WebhookController();
const validators = new WebhookValidators();

// Logistics Webhooks
router.post(
  '/shiprocket',
  webhookController.handleShiprocketWebhook
);

// Payment Webhooks
router
.get('/razorpay',
  validators.razorpayWebhook,
  webhookController.handleRazorpayWebhook).
post(
  '/razorpay',
  validators.razorpayWebhook,
  webhookController.handleRazorpayWebhook
);

router
.get('/phonepe',
  validators.phonePeWebhook,
  webhookController.handlePhonePeWebhook)
.post(
  '/phonepe',
  validators.phonePeWebhook,
  webhookController.handlePhonePeWebhook
);

router
.get('/paytm',
  validators.paytmWebhook,
  webhookController.handlePaytmWebhook)
.post(
  '/paytm',
  validators.paytmWebhook,
  webhookController.handlePaytmWebhook
);

export default router;
