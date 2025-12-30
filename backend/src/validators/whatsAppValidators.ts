import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

export default class WhatsAppValidator {
  create = validate(
    z.object({
      body: z.object({
        name: z.string().min(1),
        isAutoResume: z.boolean().optional(),
      }),
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().optional(),
        isAutoResume: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
    })
  );

  getOne = validate(
    z.object({
      query: z.object({
        id: z.string(),
      }),
    })
  );

  getAll = validate(
    z.object({
      body: z.object({
        name: z.string().optional(),
      }).optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        isPaginate: z.boolean().optional(),
        filters: z.object({
           name: z.string().optional(),
        }).optional(),
      }).optional(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: z.object({
        id: z.string(),
      }),
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
}
