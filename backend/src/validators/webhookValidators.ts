import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

/**
 * Webhook Validators
 * Validators for payment gateway webhook endpoints
 * Note: Webhooks typically don't need strict validation as they're verified by signature
 */

// PhonePe Webhook Validator
const phonePeWebhookSchema = z.object({
  body: z.record(z.any()), // Accept any payload structure
  headers: z.object({
    'x-verify': z.string().optional()
  }).passthrough() // Allow other headers
});

// Razorpay Webhook Validator
const razorpayWebhookSchema = z.object({
  body: z.record(z.any()), // Accept any payload structure
  headers: z.object({
    'x-razorpay-signature': z.string().optional()
  }).passthrough() // Allow other headers
});

// Paytm Webhook Validator
const paytmWebhookSchema = z.object({
  body: z.record(z.any()), // Accept any payload structure
  headers: z.object({}).passthrough() // Allow all headers
});

export default class WebhookValidators {
  phonePeWebhook = validate(phonePeWebhookSchema);
  razorpayWebhook = validate(razorpayWebhookSchema);
  paytmWebhook = validate(paytmWebhookSchema);
}
