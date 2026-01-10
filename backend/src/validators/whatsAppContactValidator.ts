import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter,
  dateFilter,
  numberFilter
} from './validatorCommon';

const contactFilterSchema = baseFilterSchema.extend({
  mobile: stringFilter,
  consent: booleanFilter,
  state: stringFilter,
  totalReplies: numberFilter,
});

const contactCreateSchema = z.object({
  mobile: z.string().min(10).max(15),
  consent: z.boolean().optional(),
  state: z.string().optional(),
}).strict();

const contactUpdateSchema = z.object({
  consent: z.boolean().optional(),
  state: z.string().optional(),
  // mobile should not be updated usually for contacts, but if needed
  // metadata updates? usually internal.
}).strict();

export default class WhatsAppContactValidator {
  getOne = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );

  getAll = validate(
    z.object({
      body: contactFilterSchema.partial().optional(),
      query: contactFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: contactFilterSchema.partial().merge(paginationSchema).optional(),
      query: contactFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: contactCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: contactUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: contactFilterSchema.partial(),
    })
  );
  
  // Specific Actions
  updateConsent = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({ consent: z.boolean() })
    })
  );

  markAsDND = validate(
    z.object({
      params: z.object({ id: z.string() })
    })
  );
}
