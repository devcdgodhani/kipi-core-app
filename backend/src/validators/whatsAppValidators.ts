import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter 
} from './validatorCommon';

const whatsAppSessionFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  status: stringFilter,
  isAutoResume: booleanFilter,
  isActive: booleanFilter,
});

const whatsAppSessionCreateSchema = z.object({
  name: z.string().min(1),
  isAutoResume: z.boolean().optional(),
}).strict();

const whatsAppSessionUpdateSchema = z.object({
  name: z.string().optional(),
  isAutoResume: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

export default class WhatsAppValidator {
  getOne = validate(
    z.object({
      body: whatsAppSessionFilterSchema.partial().optional(),
      query: whatsAppSessionFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: whatsAppSessionFilterSchema.partial().optional(),
      query: whatsAppSessionFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: whatsAppSessionFilterSchema.partial().merge(paginationSchema).optional(),
      query: whatsAppSessionFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: whatsAppSessionCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: whatsAppSessionUpdateSchema.partial(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: whatsAppSessionFilterSchema.partial(),
    })
  );

  sendMessage = validate(
    z.object({
      body: z.object({
        sessionId: z.string(),
        to: z.string(),
        message: z.string(),
      }),
    })
  );

  sendBulkMessage = validate(
    z.object({
      body: z.object({
        sessionId: z.string(),
        numbers: z.array(z.string()),
        message: z.string(),
      }),
    })
  );

  initializeSession = validate(
    z.object({
      body: z.object({
        id: z.string(),
      }),
    })
  );

  logoutSession = validate(
    z.object({
      body: z.object({
        id: z.string(),
      }),
    })
  );
}
