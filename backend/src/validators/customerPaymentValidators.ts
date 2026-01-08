import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { PAYMENT_GATEWAY } from '../constants/payment';

/**
 * Customer Payment Validators
 * Validators for customer-facing payment endpoints
 */

// Initiate Payment Validator
const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    gatewayName: z.nativeEnum(PAYMENT_GATEWAY, {
      message: 'Invalid payment gateway'
    })
  })
});

// Verify Payment Validator
const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    gatewayData: z.record(z.string(), z.any()).optional()
  })
});

// Get My Payments Validator
const getMyPaymentsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    skip: z.coerce.number().min(0).default(0).optional()
  }).optional()
});

// Get Payment By ID Validator
const getPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format')
  })
});

// Get Payments By Order Validator
const getPaymentsByOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format')
  })
});

// Fetch Payment Status Validator
const fetchPaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payment ID format')
  })
});

export default class CustomerPaymentValidators {
  initiatePayment = validate(initiatePaymentSchema);
  verifyPayment = validate(verifyPaymentSchema);
  getMyPayments = validate(getMyPaymentsSchema);
  getPaymentById = validate(getPaymentByIdSchema);
  getPaymentsByOrder = validate(getPaymentsByOrderSchema);
  fetchPaymentStatus = validate(fetchPaymentStatusSchema);
}
