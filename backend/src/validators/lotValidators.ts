import { z } from 'zod';
import { SOURCE_TYPE } from '../constants';

export const createLotSchema = z.object({
  body: z.object({
    lotNumber: z.string().min(1, 'Lot number is required').toUpperCase(),
    sourceType: z.nativeEnum(SOURCE_TYPE),
    supplierId: z.string().optional(),
    manufacturingDate: z.preprocess((val) => val === '' ? undefined : val, z.coerce.date().optional()),
    expiryDate: z.preprocess((val) => val === '' ? undefined : val, z.coerce.date().optional()),
    costPerUnit: z.number().min(0, 'Cost per unit must be non-negative'),
    initialQuantity: z.number().int().min(0, 'Initial quantity must be non-negative'),
    currentQuantity: z.number().int().min(0, 'Current quantity must be non-negative').optional(),
    reservedQuantity: z.number().int().min(0, 'Reserved quantity must be non-negative').default(0),
    soldQuantity: z.number().int().min(0, 'Sold quantity must be non-negative').default(0),
    damagedQuantity: z.number().int().min(0, 'Damaged quantity must be non-negative').default(0),
    purchaseOrderReference: z.string().optional(),
    qualityCheckStatus: z.enum(['PENDING', 'PASSED', 'FAILED']).default('PENDING'),
    notes: z.string().optional(),
  }),
});

export const updateLotSchema = z.object({
  body: z.object({
    lotNumber: z.string().min(1).toUpperCase().optional(),
    manufacturingDate: z.preprocess((val) => val === '' ? undefined : val, z.coerce.date().optional()),
    expiryDate: z.preprocess((val) => val === '' ? undefined : val, z.coerce.date().optional()),
    costPerUnit: z.number().min(0).optional(),
    qualityCheckStatus: z.enum(['PENDING', 'PASSED', 'FAILED']).optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Lot ID is required'),
  }),
});

export const allocateFromLotSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
  params: z.object({
    id: z.string().min(1, 'Lot ID is required'),
  }),
});

export const adjustLotStockSchema = z.object({
  body: z.object({
    quantity: z.number().int(), // Can be negative for decrements
    reason: z.string().min(1, 'Reason is required'),
  }),
  params: z.object({
    id: z.string().min(1, 'Lot ID is required'),
  }),
});


export const getExpiringLotsSchema = z.object({
  query: z.object({
    days: z.string().optional().transform(val => val ? parseInt(val) : 30),
  }),
});
