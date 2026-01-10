import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

/**
 * Customer Payment Validators
 * Validators for customer-facing payment endpoints
 */

const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
    gatewayName: z.string().min(1)
  })
});

const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format'),
    gatewayData: z.record(z.string(), z.any()).optional()
  })
});

const getMyPaymentsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    skip: z.coerce.number().min(0).default(0).optional()
  }).optional()
});

const getPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format')
  })
});

const getPaymentsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format')
  })
});

const fetchPaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format')
  })
});

export class CustomerPaymentValidators {
  initiatePayment = validate(initiatePaymentSchema);
  verifyPayment = validate(verifyPaymentSchema);
  getMyPayments = validate(getMyPaymentsSchema);
  getPaymentById = validate(getPaymentByIdSchema);
  getPaymentsByOrder = validate(getPaymentsByOrderSchema);
  fetchPaymentStatus = validate(fetchPaymentStatusSchema);
}

export const customerPaymentValidator = new CustomerPaymentValidators();
