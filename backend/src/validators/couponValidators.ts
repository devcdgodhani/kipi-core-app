import { z } from 'zod';
import { DISCOUNT_TYPE, COUPON_APPLICABILITY } from '../constants';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required').toUpperCase(),
    description: z.string().optional(),
    discountType: z.nativeEnum(DISCOUNT_TYPE),
    discountValue: z.number().min(0, 'Discount value must be non-negative'),
    applicability: z.nativeEnum(COUPON_APPLICABILITY),
    applicableCategories: z.array(z.string()).optional(),
    applicableProducts: z.array(z.string()).optional(),
    minCartValue: z.number().min(0).optional(),
    maxDiscountCap: z.number().min(0).optional(),
    userSegments: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    festivalEvent: z.string().optional(),
    dayTimeRestrictions: z.object({
      days: z.array(z.string()).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    totalUsageLimit: z.number().int().min(0).optional(),
    perUserUsageLimit: z.number().int().min(0).optional(),
    canStackWithOthers: z.boolean().default(false),
    priority: z.number().int().default(0),
    isActive: z.boolean().default(true),
    autoApply: z.boolean().default(false),
  }).refine(data => {
    // If applicability is CATEGORY, categories must be provided
    if (data.applicability === COUPON_APPLICABILITY.CATEGORY) {
      return data.applicableCategories && data.applicableCategories.length > 0;
    }
    return true;
  }, {
    message: 'Applicable categories required when applicability is CATEGORY',
    path: ['applicableCategories'],
  }).refine(data => {
    // If applicability is PRODUCT, products must be provided
    if (data.applicability === COUPON_APPLICABILITY.PRODUCT) {
      return data.applicableProducts && data.applicableProducts.length > 0;
    }
    return true;
  }, {
    message: 'Applicable products required when applicability is PRODUCT',
    path: ['applicableProducts'],
  }).refine(data => {
    // Percentage discount should be <= 100
    if (data.discountType === DISCOUNT_TYPE.PERCENTAGE) {
      return data.discountValue <= 100;
    }
    return true;
  }, {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    description: z.string().optional(),
    discountValue: z.number().min(0).optional(),
    applicableCategories: z.array(z.string()).optional(),
    applicableProducts: z.array(z.string()).optional(),
    minCartValue: z.number().min(0).optional(),
    maxDiscountCap: z.number().min(0).optional(),
    userSegments: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    festivalEvent: z.string().optional(),
    dayTimeRestrictions: z.object({
      days: z.array(z.string()).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    }).optional(),
    totalUsageLimit: z.number().int().min(0).optional(),
    perUserUsageLimit: z.number().int().min(0).optional(),
    canStackWithOthers: z.boolean().optional(),
    priority: z.number().int().optional(),
    isActive: z.boolean().optional(),
    autoApply: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Coupon ID is required'),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    cartData: z.object({
      items: z.array(z.object({
        productId: z.string(),
        categoryId: z.string(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })),
      subtotal: z.number().min(0),
      userId: z.string().optional(),
    }),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    cartData: z.object({
      items: z.array(z.object({
        productId: z.string(),
        categoryId: z.string(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })),
      subtotal: z.number().min(0),
      userId: z.string().optional(),
    }),
  }),
});

export const scheduleCouponSchema = z.object({
  body: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  }),
  params: z.object({
    id: z.string().min(1, 'Coupon ID is required'),
  }),
});
