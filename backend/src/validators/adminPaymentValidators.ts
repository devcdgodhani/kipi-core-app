import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { PAYMENT_GATEWAY } from '../constants/payment';

/**
 * Admin Payment Validators
 * Validators for admin payment gateway management endpoints
 */

// Get All Gateways Validator (no validation needed - just GET)
const getAllGatewaysSchema = z.object({}).passthrough();

// Get Enabled Gateways Validator (no validation needed - just GET)
const getEnabledGatewaysSchema = z.object({});

// Update Gateway Validator
const updateGatewaySchema = z.object({
  params: z.object({
    name: z.nativeEnum(PAYMENT_GATEWAY)
  }),
  body: z.object({
    displayName: z.string().min(1).max(100).optional(),
    isEnabled: z.boolean().optional(),
    environment: z.enum(['sandbox', 'production']).optional(),
    credentials: z.string().optional(), // Encrypted credentials string
    webhookSecret: z.string().min(10).optional(),
    priority: z.number().int().positive().optional(),
    config: z.record(z.string(), z.any()).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )
});

// Toggle Gateway Validator
const toggleGatewaySchema = z.object({
  params: z.object({
    name: z.nativeEnum(PAYMENT_GATEWAY)
  }),
  body: z.object({
    isEnabled: z.boolean()
  })
});

// Get Webhook Logs Validator
const getWebhookLogsSchema = z.object({
  query: z.object({
    provider: z.string().optional(),
    status: z.string().optional(),
    eventType: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(50).optional(),
    skip: z.coerce.number().min(0).default(0).optional()
  }).optional()
});

// Retry Webhook Validator
const retryWebhookSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid webhook log ID format')
  })
});

// Get Payments By Order Validator
const getPaymentsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format')
  })
});

export class AdminPaymentValidators {
  getAllGateways = validate(getAllGatewaysSchema);
  getEnabledGateways = validate(getEnabledGatewaysSchema);
  updateGateway = validate(updateGatewaySchema);
  toggleGateway = validate(toggleGatewaySchema);
  getWebhookLogs = validate(getWebhookLogsSchema);
  retryWebhook = validate(retryWebhookSchema);
  fetchPaymentStatus = validate(retryWebhookSchema); // Reuse ID validation
}

export const adminPaymentValidator = new AdminPaymentValidators();
