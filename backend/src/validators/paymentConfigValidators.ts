import { z } from 'zod';

export const setPaymentConfigSchema = z.object({
  body: z.object({
    entityType: z.enum(['CATEGORY', 'PRODUCT']),
    entityId: z.string().min(1, 'Entity ID is required'),
    codEnabled: z.boolean().default(true),
    prepaidEnabled: z.boolean().default(true),
    codCharges: z.object({
      type: z.enum(['FIXED', 'PERCENTAGE']),
      value: z.number().min(0, 'COD charge value must be non-negative'),
    }).optional(),
    minOrderValue: z.number().min(0, 'Min order value must be non-negative').optional(),
    maxCodAmount: z.number().min(0, 'Max COD amount must be non-negative').optional(),
  }).refine(data => data.codEnabled || data.prepaidEnabled, {
    message: 'At least one payment method must be enabled',
  }),
});

export const getPaymentConfigSchema = z.object({
  query: z.object({
    entityType: z.enum(['CATEGORY', 'PRODUCT']),
    entityId: z.string().min(1, 'Entity ID is required'),
  }),
});

export const getEffectiveConfigSchema = z.object({
  params: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});
