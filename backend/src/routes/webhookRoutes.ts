import express from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = express.Router();
const webhookController = new WebhookController();

router.post(
  '/shiprocket',
  webhookController.handleShiprocketWebhook
);

export default router;
