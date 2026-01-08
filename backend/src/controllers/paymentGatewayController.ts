import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { PaymentGatewayService } from '../services/concrete/PaymentGatewayService';
import { IApiResponse } from '../interfaces';
import { encryptObject, decryptObject } from '../helpers/encryptionHelper';

/**
 * Payment Gateway Controller
 * Handles payment gateway configuration endpoints (Admin only)
 */
export default class PaymentGatewayController {
  private gatewayService = new PaymentGatewayService();

  /**
   * Get all payment gateways
   * GET /api/v1/admin/payment-gateways
   */
  getAllGateways = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gateways = await this.gatewayService.getAllGateways();
      console.log('API getAllGateways count:', gateways.length);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payment gateways fetched successfully',
        data: gateways
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Get enabled payment gateways (public)
   * GET /api/v1/payment-gateways/enabled
   */
  getEnabledGateways = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gateways = await this.gatewayService.getEnabledGateways();

      // Remove sensitive data before sending to client
      const sanitizedGateways = gateways.map(gateway => ({
        name: gateway.name,
        displayName: gateway.displayName,
        priority: gateway.priority
      }));

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Enabled payment gateways fetched successfully',
        data: sanitizedGateways
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Create gateway configuration
   * POST /api/v1/admin/payment-gateways
   */
  createGateway = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;

      // Encrypt credentials if present
      if (payload.credentials && typeof payload.credentials === 'object') {
        payload.credentials = encryptObject(payload.credentials);
      }

      const gateway = await this.gatewayService.createGateway(payload);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Payment gateway created successfully',
        data: gateway
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      // Handle duplicate key error
      if (err.code === 11000) {
        return res.status(HTTP_STATUS_CODE.CONFLICT.STATUS).json({
          status: HTTP_STATUS_CODE.CONFLICT.STATUS,
          code: HTTP_STATUS_CODE.CONFLICT.CODE,
          message: 'Payment gateway already exists'
        });
      }
      return next(err);
    }
  };

  /**
   * Update gateway configuration
   * PUT /api/v1/admin/payment-gateways/:name
   */
  updateGateway = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      const updates = req.body;

      // Encrypt credentials if present
      if (updates.credentials && typeof updates.credentials === 'object') {
        updates.credentials = encryptObject(updates.credentials);
      }

      const gateway = await this.gatewayService.updateGateway(name as any, updates);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payment gateway updated successfully',
        data: gateway
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };

  /**
   * Toggle gateway enabled status
   * PATCH /api/v1/admin/payment-gateways/:name/toggle
   */
  toggleGateway = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      const { isEnabled } = req.body;

      await this.gatewayService.toggleGateway(name as any, isEnabled);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `Payment gateway ${isEnabled ? 'enabled' : 'disabled'} successfully`
      };

      return res.status(response.status).json(response);
    } catch (err: any) {
      return next(err);
    }
  };
}
