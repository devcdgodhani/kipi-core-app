import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  baseFilterSchema, 
  paginationSchema, 
  stringFilter, 
  numberFilter, 
  mongoIdFilter,
  dateFilter
} from './validatorCommon';

const riskEventFilterSchema = baseFilterSchema.extend({
  accountId: mongoIdFilter,
  eventType: stringFilter,
  points: numberFilter,
});

const logRiskEventSchema = z.object({
  accountId: z.string(),
  eventType: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
}).strict();

export default class WhatsAppRiskValidator {
  getOne = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
    })
  );

  getAllEvents = validate(
    z.object({
        query: riskEventFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  getAccountRiskEvents = validate(
    z.object({
      params: z.object({ accountId: z.string() }),
      query: z.object({ limit: z.coerce.number().optional() }),
    })
  );
  
  getHighRiskAccounts = validate(
      z.object({
          query: z.object({ threshold: z.coerce.number().optional() })
      })
  );

  logRiskEvent = validate(
    z.object({
      body: logRiskEventSchema,
    })
  );
}
