import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { baseFilterSchema, paginationSchema, stringFilter } from './validatorCommon';

const wishlistFilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  status: stringFilter,
});

const wishlistItemSchema = z.object({
  productId: z.string(),
  addedAt: z.date().optional(),
});

const wishlistCreateSchema = z.object({
  userId: z.string().optional(),
  products: z.array(wishlistItemSchema),
  status: z.string().optional(),
}).strict();

const wishlistUpdateSchema = z.object({
  products: z.array(wishlistItemSchema).optional(),
  status: z.string().optional(),
}).strict();

export default class WishlistValidator {
  getOne = validate(
    z.object({
      body: wishlistFilterSchema.partial().optional(),
      query: wishlistFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: wishlistFilterSchema.partial().optional(),
      query: wishlistFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: wishlistFilterSchema.partial().merge(paginationSchema).optional(),
      query: wishlistFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: wishlistCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: wishlistUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: wishlistFilterSchema.partial(),
    })
  );
}
