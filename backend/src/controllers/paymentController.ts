import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { PaymentService } from '../services/concrete/paymentService';
import { IApiResponse } from '../interfaces';
import { PAYMENT_SUCCESS_MESSAGES, PAYMENT_ERROR_MESSAGES } from '../constants/payment';

/**
 * Payment Controller
 * Handles payment-related API endpoints
 */
import { paymentService } from '../services/concrete/paymentService';

export class PaymentController {
  private get paymentService() { return paymentService; }

  /**
   * Initiate payment for an order
   * POST /api/v1/payments/initiate
   */
  initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, gatewayName } = req.body;
      const userId = (req.user as any)?._id;

      const result = await this.paymentService.initiatePayment(orderId, gatewayName, userId);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: PAYMENT_SUCCESS_MESSAGES.PAYMENT_INITIATED,
        data: {
          paymentId: result.payment._id,
          internalPaymentId: result.payment.internalPaymentId,
          redirectUrl: result.redirectUrl,
          redirectMethod: result.redirectMethod,
          gatewayData: result.gatewayData
        }
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Verify payment after callback
   * POST /api/v1/payments/verify
   */
  verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, gatewayData } = req.body;

      const payment = await this.paymentService.verifyPayment(paymentId, gatewayData);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PAYMENT_SUCCESS_MESSAGES.PAYMENT_VERIFIED,
        data: {
          paymentId: payment._id,
          status: payment.status,
          amount: payment.amount,
          orderId: payment.orderId
        }
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   */
  getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const payment = await this.paymentService.getPaymentById(id);

      if (!payment) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND
        });
      }

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payment fetched successfully',
        data: payment
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get payments for an order
   * GET /api/v1/payments/order/:orderId
   */
  getPaymentsByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const payments = await this.paymentService.getPaymentsByOrderId(orderId);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payments fetched successfully',
        data: payments
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get my payments (customer)
   * GET /api/v1/payments/my
   */
  getMyPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?._id;
      const { limit = 10, skip = 0 } = req.query;

      const payments = await this.paymentService.getPaymentsByUserId(
        userId,
        Number(limit),
        Number(skip)
      );

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payments fetched successfully',
        data: payments
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Fetch payment status from gateway
   * GET /api/v1/payments/:id/status
   */
  fetchPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const status = await this.paymentService.fetchPaymentStatus(id);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payment status fetched successfully',
        data: status
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };
}

export const paymentController = new PaymentController();
