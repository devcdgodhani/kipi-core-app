import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  dateFilter,
  mongoIdFilter
} from './validatorCommon';

const messageFilterSchema = baseFilterSchema.extend({
  accountId: mongoIdFilter,
  contactId: mongoIdFilter,
  templateId: mongoIdFilter,
  status: stringFilter,
  failureReason: stringFilter,
  jobId: stringFilter,
});

const messageCreateSchema = z.object({
  accountId: z.string(),
  contactId: z.string(),
  message: z.string().min(1),
  templateId: z.string().optional(),
  status: z.string().optional(),
  jobId: z.string(),
}).strict(); // Usually internal use, but exposed for completeness

const messageUpdateSchema = z.object({
  status: z.string().optional(),
  failureReason: z.string().optional(),
  sentAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  readAt: z.coerce.date().optional(),
}).strict();

export default class WhatsAppMessageValidator {
  getOne = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );

  getAll = validate(
    z.object({
      body: messageFilterSchema.partial().optional(),
      query: messageFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: messageFilterSchema.partial().merge(paginationSchema).optional(),
      query: messageFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: messageCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: messageUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: messageFilterSchema.partial(),
    })
  );
}
