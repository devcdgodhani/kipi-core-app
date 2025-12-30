import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
    quantity: z.number().int(), // Can be negative
    reason: z.string().min(1, 'Reason is required'),
    lotId: z.string().optional(),
  }),
});

export const reserveStockSchema = z.object({
  body: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const releaseStockSchema = z.object({
  body: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const updateThresholdSchema = z.object({
  body: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
    threshold: z.number().int().min(0, 'Threshold must be non-negative'),
  }),
});

export const getStockBySkuSchema = z.object({
  params: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
  }),
});
