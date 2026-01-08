import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { WebhookHandlerService } from '../services/concrete/WebhookHandlerService';
import { PAYMENT_GATEWAY } from '../constants/payment';

/**
 * Webhook Controller
 * Handles webhook callbacks from payment gateways
 */
export default class PaymentWebhookController {
  private webhookService = new WebhookHandlerService();

  /**
   * Handle PhonePe webhook
   * POST /api/v1/webhook/phonepe/payment
   */
  handlePhonePeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const signature = (req.headers['x-verify'] || req.headers['authorization']) as string;

      const result = await this.webhookService.processWebhook(
        PAYMENT_GATEWAY.PHONEPE,
        payload,
        req.headers as any,
        signature
      );

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };

  /**
   * Handle Razorpay webhook
   * POST /api/v1/webhook/razorpay/payment
   */
  handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const signature = req.headers['x-razorpay-signature'] as string;

      const result = await this.webhookService.processWebhook(
        PAYMENT_GATEWAY.RAZORPAY,
        payload,
        req.headers as any,
        signature
      );

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };

  /**
   * Handle Paytm webhook
   * POST /api/v1/webhook/paytm/payment
   */
  handlePaytmWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const signature = req.body.CHECKSUMHASH || '';

      const result = await this.webhookService.processWebhook(
        PAYMENT_GATEWAY.PAYTM,
        payload,
        req.headers as any,
        signature
      );

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };

  /**
   * Get webhook logs (Admin)
   * GET /api/v1/admin/webhooks/logs
   */
  getWebhookLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider, status, eventType, limit = 50, skip = 0 } = req.query;

      const logs = await this.webhookService.getWebhookLogs(
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
   * POST /api/v1/admin/webhooks/:id/retry
   */
  retryWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const result = await this.webhookService.retryWebhook(id);

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
