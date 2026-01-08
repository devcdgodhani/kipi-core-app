import express from 'express';
import { WebhookController } from '../controllers/webhookController';
import WebhookValidators from '../validators/webhookValidators';

const router = express.Router();
const webhookController = new WebhookController();
const validators = new WebhookValidators();

router.post(
  '/shiprocket',
  webhookController.handleShiprocketWebhook
);

router.post(
  '/razorpay',
  validators.razorpayWebhook,
  webhookController.handleRazorpayWebhook
);

router.post(
  '/phonepe',
  validators.phonePeWebhook,
  webhookController.handlePhonePeWebhook
);

router.post(
  '/paytm',
  validators.paytmWebhook,
  webhookController.handlePaytmWebhook
);

export default router;
