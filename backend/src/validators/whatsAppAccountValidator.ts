import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  booleanFilter,
  numberFilter,
  dateFilter
} from './validatorCommon';

const accountFilterSchema = baseFilterSchema.extend({
  name: stringFilter,
  number: stringFilter,
  status: stringFilter,
  socketStatus: stringFilter,
  isAuthenticated: booleanFilter,
  isAutoResume: booleanFilter,
  riskScore: numberFilter,
});

const accountCreateSchema = z.object({
  name: z.string().min(1).max(100),
  number: z.string().optional(),
  isAutoResume: z.boolean().default(true),
  numberActivatedAt: z.coerce.date().optional(),
}).strict();

const accountUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isAutoResume: z.boolean().optional(),
  numberActivatedAt: z.coerce.date().nullable().optional(),
  // Risk score and status are system managed, but allow manual override if needed?
  // For now, restricting manual update of status via generic update, use specific actions instead.
}).strict();

export default class WhatsAppAccountValidator {
  getOne = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );

  getAll = validate(
    z.object({
      body: accountFilterSchema.partial().optional(),
      query: accountFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: accountFilterSchema.partial().merge(paginationSchema).optional(),
      query: accountFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: accountCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: accountUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: accountFilterSchema.partial(),
    })
  );

  // Specific Actions
  actionById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );

  sendMessage = validate(
      z.object({
          params: z.object({ id: z.string() }),
          body: z.object({
              to: z.string(),
              message: z.string(),
              templateId: z.string().optional()
          })
      })
  );

  sendBulkMessage = validate(
      z.object({
          body: z.object({
              recipients: z.array(z.object({ mobile: z.string(), message: z.string() })),
              templateId: z.string().optional()
          })
      })
  );

  sendLoadBalancedMessage = validate(
      z.object({
          body: z.object({
              to: z.string(),
              message: z.string(),
              templateId: z.string().optional()
          })
      })
  );
}
