import { z } from 'zod';
import { validate } from '../helpers/zodValidator';

export class WhatsAppSystemValidator {
  getQueueStatus = validate(
    z.object({})
  );

  retryFailedJobs = validate(
    z.object({})
  );

  cleanQueue = validate(
    z.object({
        body: z.object({
            status: z.enum(['completed', 'wait', 'active', 'delayed', 'failed', 'paused']),
            limit: z.number().optional()
        })
    })
  );
  
  clearQueue = validate(
      z.object({})
  );

  getDashboardStats = validate(
      z.object({})
  );

  pause = validate(
    z.object({})
  );

  resume = validate(
    z.object({})
  );

  resetCounters = validate(
    z.object({})
  );
}

export const whatsAppSystemValidator = new WhatsAppSystemValidator();
