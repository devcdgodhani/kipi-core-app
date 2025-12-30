import { z } from 'zod';

export const createPriceSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'SKU ID is required'),
    mrp: z.number().min(0, 'MRP must be non-negative'),
    sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
    costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),
    effectiveFrom: z.string().datetime().optional(),
    effectiveTo: z.string().datetime().optional(),
    bulkPricingRules: z.array(z.object({
      minQuantity: z.number().int().min(1, 'Min quantity must be at least 1'),
      maxQuantity: z.number().int().min(1).optional(),
      price: z.number().min(0, 'Price must be non-negative'),
    })).optional(),
    isActive: z.boolean().default(true),
  }).refine(data => data.sellingPrice <= data.mrp, {
    message: 'Selling price cannot exceed MRP',
    path: ['sellingPrice'],
  }),
});

export const updatePriceSchema = z.object({
  body: z.object({
    mrp: z.number().min(0).optional(),
    sellingPrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    effectiveFrom: z.string().datetime().optional(),
    effectiveTo: z.string().datetime().optional(),
    bulkPricingRules: z.array(z.object({
      minQuantity: z.number().int().min(1),
      maxQuantity: z.number().int().min(1).optional(),
      price: z.number().min(0),
    })).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Price ID is required'),
  }),
});

export const bulkUpdatePricesSchema = z.object({
  body: z.object({
    criteria: z.object({
      sku: z.string().optional(),
      isActive: z.boolean().optional(),
    }),
    updates: z.object({
      mrp: z.number().min(0).optional(),
      sellingPrice: z.number().min(0).optional(),
      costPrice: z.number().min(0).optional(),
      isActive: z.boolean().optional(),
    }),
  }),
});

export const applyBulkPricingSchema = z.object({
  body: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const getPriceBySkuSchema = z.object({
  params: z.object({
    skuId: z.string().min(1, 'SKU ID is required'),
  }),
});
