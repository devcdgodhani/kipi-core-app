import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/concrete/webhookService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';
import { logisticsQueues, QUEUE_NAMES } from '../jobs/queues/logisticsQueues';
import { JOB_NAMES } from '../jobs/types';
import { PAYMENT_GATEWAY } from '../constants/payment';

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

  handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const paymentService = new (await import('../services/concrete/PaymentService')).PaymentService();
      const gatewayService = new (await import('../services/concrete/PaymentGatewayService')).PaymentGatewayService();

      // 1. Verify Signature
      const isValid = await gatewayService.verifyWebhook(PAYMENT_GATEWAY.RAZORPAY, req.body, signature);
      if (!isValid) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({ message: 'Invalid signature' });
      }

      // 2. Extract Payment Info
      // Razorpay sends event 'payment.captured' or 'order.paid'
      const event = req.body.event;
      if (event === 'payment.captured' || event === 'order.paid') {
        const razorpayOrderId = req.body.payload.payment?.entity?.order_id || req.body.payload.order?.entity?.id;
        const payment = await (await import('../db/mongodb/models/paymentModel')).PaymentModel.findOne({ gatewayOrderId: razorpayOrderId });
        
        if (payment) {
          await paymentService.verifyPayment(payment._id.toString(), req.body.payload.payment?.entity || req.body.payload);
        }
      }

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'ok' });
    } catch (err) {
      console.error('Razorpay Webhook Error:', err);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'error_logged' });
    }
  };

  handlePhonePeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-verify'] as string;
      const paymentService = new (await import('../services/concrete/PaymentService')).PaymentService();
      const gatewayService = new (await import('../services/concrete/PaymentGatewayService')).PaymentGatewayService();

      // PhonePe payload is base64 encoded in the request body
      const base64Response = req.body.response;
      const decodedResponse = JSON.parse(Buffer.from(base64Response, 'base64').toString());

      // 1. Verify Signature
      const isValid = await gatewayService.verifyWebhook(PAYMENT_GATEWAY.PHONEPE, decodedResponse, signature);
      if (!isValid) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({ message: 'Invalid signature' });
      }

      // 2. Process Payment
      if (decodedResponse.success) {
        const merchantTransactionId = decodedResponse.data.merchantTransactionId;
        const payment = await (await import('../db/mongodb/models/paymentModel')).PaymentModel.findOne({ gatewayTransactionId: merchantTransactionId });
        
        if (payment) {
          await paymentService.verifyPayment(payment._id.toString(), decodedResponse.data);
        }
      }

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'ok' });
    } catch (err) {
      console.error('PhonePe Webhook Error:', err);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'error_logged' });
    }
  };

  handlePaytmWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentService = new (await import('../services/concrete/PaymentService')).PaymentService();
      const gatewayService = new (await import('../services/concrete/PaymentGatewayService')).PaymentGatewayService();

      // Paytm sends data as form-data/x-www-form-urlencoded
      const payload = req.body;
      const signature = payload.CHECKSUMHASH;

      // 1. Verify Signature
      const isValid = await gatewayService.verifyWebhook(PAYMENT_GATEWAY.PAYTM, payload, signature);
      if (!isValid) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({ message: 'Invalid signature' });
      }

      // 2. Process Payment
      if (payload.STATUS === 'TXN_SUCCESS') {
        const orderId = payload.ORDERID;
        const payment = await (await import('../db/mongodb/models/paymentModel')).PaymentModel.findOne({ gatewayOrderId: orderId });
        
        if (payment) {
          await paymentService.verifyPayment(payment._id.toString(), payload);
        }
      }

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'ok' });
    } catch (err) {
      console.error('Paytm Webhook Error:', err);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({ status: 'error_logged' });
    }
  };
}
