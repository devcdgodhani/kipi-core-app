import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter, booleanFilter } from './validatorCommon';

const reviewFilterSchema = baseFilterSchema.extend({
  productId: stringFilter,
  userId: stringFilter,
  status: stringFilter,
  isVisible: booleanFilter,
});

const reviewCreateSchema = z.object({
  productId: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000),
  status: z.string().optional(),
  isVisible: z.boolean().optional(),
}).strict();

const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  status: z.string().optional(),
  isVisible: z.boolean().optional(),
}).strict();

export default class ReviewValidator {
  getOne = validate(
    z.object({
      body: reviewFilterSchema.partial().optional(),
      query: reviewFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: reviewFilterSchema.partial().optional(),
      query: reviewFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: reviewFilterSchema.partial().merge(paginationSchema).optional(),
      query: reviewFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: reviewCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: reviewUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: reviewFilterSchema.partial(),
    })
  );
}
