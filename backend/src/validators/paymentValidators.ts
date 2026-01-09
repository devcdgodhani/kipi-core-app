import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PAYMENT_GATEWAY, REFUND_REASON } from '../constants/payment';
import { HTTP_STATUS_CODE } from '../constants';
 
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
 
export const initiatePaymentValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    initiatePaymentSchema.parse({ body: req.body });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
 
// Verify Payment Validator
const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    gatewayData: z.record(z.string(), z.any()).optional()
  })
});
 
export const verifyPaymentValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    verifyPaymentSchema.parse({ body: req.body });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
 
// Initiate Refund Validator
const initiateRefundSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
    amount: z.number().positive('Amount must be positive'),
    reason: z.nativeEnum(REFUND_REASON),
    notes: z.string().optional()
  })
});
 
export const initiateRefundValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    initiateRefundSchema.parse({ body: req.body });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
 
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
 
export const updateGatewayValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateGatewaySchema.parse({ body: req.body });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
 
// Toggle Gateway Validator
const toggleGatewaySchema = z.object({
  body: z.object({
    isEnabled: z.boolean()
  })
});
 
export const toggleGatewayValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    toggleGatewaySchema.parse({ body: req.body });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
 
// MongoDB ObjectId Validator
const mongoIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
  })
});
 
export const mongoIdValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    mongoIdSchema.parse({ params: req.params });
    next();
  } catch (error: unknown) {
    const errorDetails = error instanceof z.ZodError ? (error as any).errors : [];
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
      status: HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
      code: HTTP_STATUS_CODE.BAD_REQUEST.CODE,
      message: 'Validation failed',
      errors: errorDetails
    });
  }
};
