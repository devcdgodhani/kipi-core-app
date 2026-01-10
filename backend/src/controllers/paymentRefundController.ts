import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { PaymentRefundService } from '../services/concrete/paymentRefundService';
import { IApiResponse } from '../interfaces';
import { PAYMENT_SUCCESS_MESSAGES } from '../constants/payment';

/**
 * Payment Refund Controller
 * Handles refund-related API endpoints
 */
import { paymentRefundService } from '../services/concrete/paymentRefundService';

export class PaymentRefundController {
  private get refundService() { return paymentRefundService; }

  /**
   * Initiate refund for a payment
   * POST /api/v1/refunds/initiate
   */
  initiateRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, amount, reason, notes } = req.body;
      const userId = (req.user as any)?._id;

      const refund = await this.refundService.initiateRefund(
        paymentId,
        amount,
        reason,
        notes,
        userId
      );

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: PAYMENT_SUCCESS_MESSAGES.REFUND_INITIATED,
        data: {
          refundId: refund._id,
          refundNumber: refund.refundNumber,
          amount: refund.amount,
          status: refund.status
        }
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get refund by ID
   * GET /api/v1/refunds/:id
   */
  getRefundById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const refund = await this.refundService.getRefundById(id);

      if (!refund) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Refund not found'
        });
      }

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Refund fetched successfully',
        data: refund
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get refunds for a payment
   * GET /api/v1/refunds/payment/:paymentId
   */
  getRefundsByPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;

      const refunds = await this.refundService.getRefundsByPaymentId(paymentId);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Refunds fetched successfully',
        data: refunds
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get refunds for an order
   * GET /api/v1/refunds/order/:orderId
   */
  getRefundsByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const refunds = await this.refundService.getRefundsByOrderId(orderId);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Refunds fetched successfully',
        data: refunds
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get my refunds (customer)
   * GET /api/v1/refunds/my
   */
  getMyRefunds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any)?._id;
      const { limit = 10, skip = 0 } = req.query;

      const refunds = await this.refundService.getRefundsByUserId(
        userId,
        Number(limit),
        Number(skip)
      );

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Refunds fetched successfully',
        data: refunds
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };
}

export const paymentRefundController = new PaymentRefundController();
