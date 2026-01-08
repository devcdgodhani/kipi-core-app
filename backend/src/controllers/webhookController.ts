import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/concrete/webhookService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';
import { logisticsQueues } from '../jobs/queues/logisticsQueues';
import { paymentQueues } from '../jobs/queues/paymentQueues';
import { JOB_NAMES } from '../jobs/types';
import { PAYMENT_GATEWAY } from '../constants/payment';
import { WebhookHandlerService } from '../services/concrete/WebhookHandlerService';

export class WebhookController {
  
  /**
   * Handle Shiprocket webhook (Logistics)
   */
  handleShiprocketWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isValid, normalizedEvent } = await webhookService.validateAndLog(req.body, req.headers, 'SHIPROCKET');

      if (!isValid) {
        const response: IApiResponse<null> = {
          status: HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          code: HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          message: 'Invalid Signature',
          data: null
        };
        return res.status(response.status).json(response);
      }

      await logisticsQueues.webhookQueue.add(JOB_NAMES.PROCESS_WEBHOOK, {
        provider: 'SHIPROCKET',
        headers: req.headers,
        body: normalizedEvent,
        receivedAt: new Date().toISOString()
      });

      const response: IApiResponse<null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Webhook received and queued successfully',
        data: null
      };

      return res.status(response.status).json(response);
    } catch (err) {
      console.error('Shiprocket Webhook Error:', err);
      return res.status(200).json({ message: 'Webhook received (error logged)' });
    }
  };

  /**
   * Handle Razorpay webhook (Payment)
   */
  handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const handlerService = new WebhookHandlerService();

      const { isValid, logId } = await handlerService.validateAndLog(
        PAYMENT_GATEWAY.RAZORPAY,
        req.body,
        req.headers as any,
        signature
      );

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      await paymentQueues.webhookQueue.add(JOB_NAMES.PROCESS_PAYMENT_WEBHOOK, {
        provider: PAYMENT_GATEWAY.RAZORPAY,
        body: req.body,
        headers: req.headers,
        receivedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, message: 'Webhook received and queued', logId });
    } catch (err: any) {
       console.error('Razorpay Webhook Error:', err);
       return res.status(200).json({ success: true, message: 'Webhook received (error logged)' });
    }
  };

  /**
   * Handle PhonePe webhook (Payment)
   */
  handlePhonePeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = (req.headers['x-verify'] || req.headers['authorization']) as string;
      const handlerService = new WebhookHandlerService();

      let payload = req.body;
      if (req.body.response) {
        const decoded = Buffer.from(req.body.response, 'base64').toString();
        payload = JSON.parse(decoded);
      }

      const { isValid, logId } = await handlerService.validateAndLog(
        PAYMENT_GATEWAY.PHONEPE,
        payload,
        req.headers as any,
        signature
      );

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      await paymentQueues.webhookQueue.add(JOB_NAMES.PROCESS_PAYMENT_WEBHOOK, {
        provider: PAYMENT_GATEWAY.PHONEPE,
        body: payload,
        headers: req.headers,
        receivedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, message: 'Webhook received and queued', logId });
    } catch (err: any) {
      console.error('PhonePe Webhook Error:', err);
      return res.status(200).json({ success: true, message: 'Webhook received (error logged)' });
    }
  };

  /**
   * Handle Paytm webhook (Payment)
   */
  handlePaytmWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const handlerService = new WebhookHandlerService();

      const payload = req.body;
      const signature = payload.CHECKSUMHASH || '';

      const { isValid, logId } = await handlerService.validateAndLog(
        PAYMENT_GATEWAY.PAYTM,
        payload,
        req.headers as any,
        signature
      );

      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      await paymentQueues.webhookQueue.add(JOB_NAMES.PROCESS_PAYMENT_WEBHOOK, {
        provider: 'PAYTM',
        body: payload,
        headers: req.headers,
        receivedAt: new Date().toISOString()
      });

      return res.status(200).json({ success: true, message: 'Webhook received and queued', logId });
    } catch (err: any) {
      console.error('Paytm Webhook Error:', err);
      return res.status(200).json({ success: true, message: 'Webhook received (error logged)' });
    }
  };

  /**
   * Get webhook logs (Admin)
   */
  getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider, status, eventType, limit = 50, skip = 0 } = req.query;
      const handlerService = new WebhookHandlerService();

      const logs = await handlerService.getWebhookLogs(
        {
          provider: provider as string,
          status: status as string,
          eventType: eventType as string
        },
        Number(limit),
        Number(skip)
      );

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Webhook logs fetched successfully',
        data: logs
      });
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Retry failed webhook (Admin)
   */
  retryWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const handlerService = new WebhookHandlerService();

      const result = await handlerService.retryWebhook(id);

      return res.status(result.success ? 200 : 400).json({
        status: result.success ? HTTP_STATUS_CODE.OK.STATUS : HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        code: result.success ? HTTP_STATUS_CODE.OK.CODE : HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        message: result.message
      });
    } catch (err: any) {
      return next(err);
    }
  };
}
