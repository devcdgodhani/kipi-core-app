import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/concrete/webhookService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';
import { logisticsQueues, QUEUE_NAMES } from '../jobs/queues/logisticsQueues';
import { JOB_NAMES } from '../jobs/types';

export class WebhookController {
  
  handleShiprocketWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate and Log (Synchronous)
      // This ensures we only accept valid requests and have a record of them.
      const { isValid, normalizedEvent } = await webhookService.validateAndLog(req.body, req.headers, 'SHIPROCKET');

      if (!isValid) {
        // Invalid signature - reject
         const response: IApiResponse<null> = {
          status: HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          code: HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          message: 'Invalid Signature',
          data: null
        };
        return res.status(response.status).json(response);
      }

      // 2. Push to Queue (Asynchronous)
      // We pass the NORMALIZED event as the body to the worker
      await logisticsQueues.webhookQueue.add(JOB_NAMES.PROCESS_WEBHOOK, {
        provider: 'SHIPROCKET',
        headers: req.headers, // Optional, since we already validated
        body: normalizedEvent, // Pass normalized event!
        receivedAt: new Date().toISOString()
      });

      // 3. Return 200 OK immediately
      const response: IApiResponse<null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Webhook received and queued successfully',
        data: null
      };

      return res.status(response.status).json(response);
    } catch (err) {
      console.error('Webhook Error:', err);
      // Return 200 OK even on error to prevent provider retries if it's our internal issue 
      // (unless we want them to retry, but for now safe fail)
      const response: IApiResponse<null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Webhook received (error logged)',
        data: null
      };
      return res.status(response.status).json(response);
    }
  };
}
