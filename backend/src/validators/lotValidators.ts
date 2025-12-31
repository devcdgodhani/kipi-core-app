import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  numberFilter, 
  dateFilter 
} from './validatorCommon';
import { LOT_TYPE, LOT_STATUS } from '../constants';

const lotFilterSchema = baseFilterSchema.extend({
  lotNumber: stringFilter,
  type: stringFilter,
  supplierId: stringFilter,
  status: stringFilter,
  startDate: dateFilter,
  endDate: dateFilter,
  basePrice: numberFilter,
});

const lotCreateSchema = z.object({
  lotNumber: z.string().min(1),
  type: z.nativeEnum(LOT_TYPE).optional(),
  supplierId: z.string().optional(),
  basePrice: z.number().min(0),
  quantity: z.number().min(0),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.nativeEnum(LOT_STATUS).optional(),
  notes: z.string().optional(),
}).strict();

const lotUpdateSchema = lotCreateSchema.partial();

export default class LotValidator {
  getOne = validate(
    z.object({
      body: lotFilterSchema.partial().optional(),
      query: lotFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: lotFilterSchema.partial().optional(),
      query: lotFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: lotFilterSchema.partial().merge(paginationSchema).optional(),
      query: lotFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: lotCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: lotUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: lotFilterSchema.partial(),
    })
  );
}
