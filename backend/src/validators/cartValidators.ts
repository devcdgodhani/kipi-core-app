import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter 
} from './validatorCommon';

const cartFilterSchema = baseFilterSchema.extend({
  userId: stringFilter,
  status: stringFilter,
});

const cartItemSchema = z.object({
  skuId: z.string(),
  productId: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  offerPrice: z.number().min(0).optional(),
});

const cartCreateSchema = z.object({
  userId: z.string(),
  items: z.array(cartItemSchema),
  status: z.string().optional(),
}).strict();

const cartUpdateSchema = z.object({
  items: z.array(cartItemSchema).optional(),
  status: z.string().optional(),
}).strict();

export default class CartValidator {
  getOne = validate(
    z.object({
      body: cartFilterSchema.partial().optional(),
      query: cartFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: cartFilterSchema.partial().optional(),
      query: cartFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: cartFilterSchema.partial().merge(paginationSchema).optional(),
      query: cartFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: cartCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: cartUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: cartFilterSchema.partial(),
    })
  );
}
