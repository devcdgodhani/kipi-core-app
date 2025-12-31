import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  numberFilter 
} from './validatorCommon';
import { SKU_STATUS } from '../constants/sku';

const skuFilterSchema = baseFilterSchema.extend({
  productId: stringFilter,
  skuCode: stringFilter,
  status: stringFilter,
  price: numberFilter,
  salePrice: numberFilter,
  quantity: numberFilter,
});

const skuCreateSchema = z.object({
  productId: z.string().min(1),
  skuCode: z.string().min(1),
  
  variantAttributes: z.array(z.object({
    attributeId: z.string(),
    value: z.any()
  })).optional(),
  
  price: z.number().optional(),
  salePrice: z.number().optional(),
  
  quantity: z.number().optional(),
  images: z.array(z.string()).optional(),
  
  status: z.nativeEnum(SKU_STATUS).optional(),
  lotId: z.string().optional()
});

const skuUpdateSchema = skuCreateSchema.partial();

export default class SkuValidator {
  getOne = validate(
    z.object({
      body: skuFilterSchema.partial().optional(),
      query: skuFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: skuFilterSchema.partial().optional(),
      query: skuFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: skuFilterSchema.partial().merge(paginationSchema).optional(),
      query: skuFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: skuCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: skuUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: skuFilterSchema.partial(),
    })
  );
}
