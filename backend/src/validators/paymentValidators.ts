import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PAYMENT_GATEWAY, REFUND_REASON } from '../constants/payment';
import { HTTP_STATUS_CODE } from '../constants';
import { validate } from '../helpers/zodValidator';
 
/**
 * Payment Validators
 * Zod schemas for payment-related API endpoints
 */
 
// Initiate Payment Validator
const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    gatewayName: z.nativeEnum(PAYMENT_GATEWAY)
  })
});

// Verify Payment Validator
const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    gatewayData: z.record(z.string(), z.any()).optional()
  })
});

// Initiate Refund Validator
const initiateRefundSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    amount: z.number().positive('Amount must be positive'),
    reason: z.nativeEnum(REFUND_REASON),
    notes: z.string().optional()
  })
});

// Update Gateway Validator
const updateGatewaySchema = z.object({
  body: z.object({
    displayName: z.string().optional(),
    isEnabled: z.boolean().optional(),
    environment: z.enum(['sandbox', 'production']).optional(),
    credentials: z.string().optional(), // Encrypted credentials
    webhookSecret: z.string().optional(),
    priority: z.number().int().positive().optional(),
    config: z.record(z.string(), z.any()).optional()
  })
});

// Toggle Gateway Validator
const toggleGatewaySchema = z.object({
  body: z.object({
    isEnabled: z.boolean()
  })
});

// MongoDB ObjectId Validator
const mongoIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
  })
});

export class PaymentValidators {
  initiatePayment = validate(initiatePaymentSchema);
  verifyPayment = validate(verifyPaymentSchema);
  initiateRefund = validate(initiateRefundSchema);
  updateGateway = validate(updateGatewaySchema);
  toggleGateway = validate(toggleGatewaySchema);
  mongoId = validate(mongoIdSchema);
}

export const paymentValidator = new PaymentValidators();

// Deprecated functional exports
export const initiatePaymentValidator = paymentValidator.initiatePayment;
export const verifyPaymentValidator = paymentValidator.verifyPayment;
export const initiateRefundValidator = paymentValidator.initiateRefund;
export const updateGatewayValidator = paymentValidator.updateGateway;
export const toggleGatewayValidator = paymentValidator.toggleGateway;
export const mongoIdValidator = paymentValidator.mongoId;
