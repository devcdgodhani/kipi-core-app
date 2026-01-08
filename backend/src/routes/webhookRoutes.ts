import express from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = express.Router();
const webhookController = new WebhookController();

router.post(
  '/shiprocket',
  webhookController.handleShiprocketWebhook
);

router.post(
  '/razorpay',
  webhookController.handleRazorpayWebhook
);

router.post(
  '/phonepe',
  webhookController.handlePhonePeWebhook
);

router.post(
  '/paytm',
  webhookController.handlePaytmWebhook
);

export default router;
