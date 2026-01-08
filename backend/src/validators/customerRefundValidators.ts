import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { REFUND_REASON } from '../constants/payment';

/**
 * Customer Refund Validators
 * Validators for customer-facing refund endpoints
 */

// Initiate Refund Validator
const initiateRefundSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    amount: z.number().positive('Amount must be positive'),
    reason: z.nativeEnum(REFUND_REASON, {
      message: 'Invalid refund reason'
    }),
    notes: z.string().max(500).optional()
  })
});

// Get My Refunds Validator
const getMyRefundsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    skip: z.coerce.number().min(0).default(0).optional()
  }).optional()
});

// Get Refund By ID Validator
const getRefundByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid refund ID format')
  })
});

// Get Refunds By Payment Validator
const getRefundsByPaymentSchema = z.object({
  params: z.object({
    paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format')
  })
});

// Get Refunds By Order Validator
const getRefundsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format')
  })
});

export default class CustomerRefundValidators {
  initiateRefund = validate(initiateRefundSchema);
  getMyRefunds = validate(getMyRefundsSchema);
  getRefundById = validate(getRefundByIdSchema);
  getRefundsByPayment = validate(getRefundsByPaymentSchema);
  getRefundsByOrder = validate(getRefundsByOrderSchema);
}
