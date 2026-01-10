import express from 'express';
import { webhookController } from '../controllers/webhookController';
import { webhookValidator } from '../validators/webhookValidators';

const router = express.Router();

// Logistics Webhooks
router.post(
  '/shiprocket',
  webhookController.handleShiprocketWebhook
);

// Payment Webhooks
router
.get('/razorpay',
  webhookValidator.razorpayWebhook,
  webhookController.handleRazorpayWebhook).
post(
  '/razorpay',
  webhookValidator.razorpayWebhook,
  webhookController.handleRazorpayWebhook
);

router
.get('/phonepe',
  // webhookValidator.phonePeWebhook,
  webhookController.handlePhonePeWebhook)
.post(
  '/phonepe',
  // webhookValidator.phonePeWebhook,
  webhookController.handlePhonePeWebhook
);

router
.get('/paytm',
  webhookValidator.paytmWebhook,
  webhookController.handlePaytmWebhook)
.post(
  '/paytm',
  webhookValidator.paytmWebhook,
  webhookController.handlePaytmWebhook
);

export default router;
