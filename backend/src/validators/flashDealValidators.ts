import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter, numberFilter, dateFilter } from './validatorCommon';

const flashDealFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  status: stringFilter,
  discountType: stringFilter,
});

const flashDealCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  productIds: z.array(z.string()),
  discountType: z.string(),
  discountValue: z.number(),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  maxQuantityPerUser: z.number().optional(),
  totalQuantityLimit: z.number().optional(),
  status: z.string().optional(),
}).strict();

const flashDealUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  discountType: z.string().optional(),
  discountValue: z.number().optional(),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional(),
  maxQuantityPerUser: z.number().optional(),
  totalQuantityLimit: z.number().optional(),
  currentQuantitySold: z.number().optional(),
  status: z.string().optional(),
}).strict();

export class FlashDealValidator {
  getOne = validate(z.object({ body: flashDealFilterSchema.partial().optional(), query: flashDealFilterSchema.partial().optional() }));
  getAll = validate(z.object({ body: flashDealFilterSchema.partial().optional(), query: flashDealFilterSchema.partial().optional() }));
  getWithPagination = validate(z.object({ body: flashDealFilterSchema.partial().merge(paginationSchema).optional(), query: flashDealFilterSchema.partial().merge(paginationSchema).optional() }));
  create = validate(z.object({ body: flashDealCreateSchema }));
  updateById = validate(z.object({ params: z.object({ id: z.string() }), body: flashDealUpdateSchema.partial() }));
  deleteByFilter = validate(z.object({ body: flashDealFilterSchema.partial() }));
}

export const flashDealValidator = new FlashDealValidator();
