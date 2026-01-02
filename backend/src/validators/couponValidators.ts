import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { COUPON_STATUS, COUPON_TYPE } from '../constants/coupon';

const couponCreateSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.nativeEnum(COUPON_TYPE),
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  usageLimit: z.number().int().positive().optional(),
  userIds: z.array(z.string()).optional(),
  status: z.nativeEnum(COUPON_STATUS).optional(),
});

const couponUpdateSchema = couponCreateSchema.partial();

const filterSchema = z.object({
  code: z.string().optional(),
  status: z.nativeEnum(COUPON_STATUS).optional(),
  isDeleted: z.boolean().optional(),
});

export default class CouponValidator {
  create = validate(
    z.object({
      body: couponCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: couponUpdateSchema,
    })
  );

  getOne = validate(
    z.object({
      params: z.object({ id: z.string().optional() }),
      query: z.object({ _id: z.string().optional(), code: z.string().optional() }).optional(),
      body: z.object({ _id: z.string().optional(), code: z.string().optional() }).optional(),
    })
  );

  getAll = validate(
    z.object({
      query: filterSchema.optional(),
      body: filterSchema.optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      query: filterSchema.extend({
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      body: filterSchema.optional(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: filterSchema,
    })
  );

  apply = validate(
    z.object({
      body: z.object({
        code: z.string().min(1),
        orderAmount: z.number().positive(),
      }),
    })
  );
}
