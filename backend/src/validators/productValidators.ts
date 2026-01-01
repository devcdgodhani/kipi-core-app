import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  numberFilter 
} from './validatorCommon';
import { PRODUCT_STATUS } from '../constants/product';

const productFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  status: stringFilter,
  categoryIds: stringFilter,
  slug: stringFilter,
  basePrice: numberFilter,
  salePrice: numberFilter,
  offerPrice: numberFilter,
  discount: numberFilter,
});

const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  
  basePrice: z.number().min(0),
  salePrice: z.number().optional(),
  offerPrice: z.number().optional(),
  discount: z.number().optional(),
  currency: z.string().optional().default('INR'),
  
  media: z.array(z.any()).optional(),
  mainImage: z.string().optional(),
  
  categoryIds: z.array(z.string()).optional(),
  
  attributes: z.array(z.object({
    attributeId: z.string(),
    value: z.any(),
    label: z.string().optional()
  })).optional(),
  
  status: z.nativeEnum(PRODUCT_STATUS).optional(),
  stock: z.number().optional(),
  skus: z.array(z.object({
    skuCode: z.string(),
    basePrice: z.number().optional(),
    salePrice: z.number().optional(),
    offerPrice: z.number().optional(),
    discount: z.number().optional(),
    quantity: z.number().min(0),
    variantAttributes: z.array(z.object({
      attributeId: z.string(),
      value: z.any()
    })).optional(),
    media: z.array(z.any()).optional(),
    status: z.string().optional()
  })).optional()
});

const productUpdateSchema = productCreateSchema.partial();

export default class ProductValidator {
  getOne = validate(
    z.object({
      body: productFilterSchema.partial().optional(),
      query: productFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: productFilterSchema.partial().optional(),
      query: productFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: productFilterSchema.partial().merge(paginationSchema).optional(),
      query: productFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: productCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: productUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: productFilterSchema.partial(),
    })
  );
}
