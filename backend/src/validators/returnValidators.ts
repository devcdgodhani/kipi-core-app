import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema 
} from './validatorCommon';
import { RETURN_REASON } from '../constants/return';

const returnCreateSchema = z.object({
  orderId: z.string().min(1),
  items: z.array(z.object({
    skuId: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    reason: z.nativeEnum(RETURN_REASON),
    description: z.string().optional()
  })).min(1),
  totalRefundAmount: z.number().min(0)
});

export default class ReturnValidator {
  create = validate(
    z.object({
      body: returnCreateSchema,
    })
  );

  getWithPagination = validate(
    z.object({
      body: baseFilterSchema.partial().merge(paginationSchema).optional(),
      query: baseFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  getOne = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );
}
