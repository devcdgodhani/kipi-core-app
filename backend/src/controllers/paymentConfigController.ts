import { NextFunction, Request, Response } from 'express';
import { paymentConfigService } from '../services/concrete';
import { HTTP_STATUS_CODE } from '../constants';
import { BaseController } from './baseController';
import { IPaymentConfig, IPaymentConfigAttributes } from '../interfaces';
import { successResponse } from '../helpers';

export class PaymentConfigController extends BaseController<IPaymentConfigAttributes, IPaymentConfig> {
  constructor() {
    super(paymentConfigService, 'PaymentConfig');
  }

  // Override getOne to populate references
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = paymentConfigService.generateFilter({
        filters: reqData,
      });

      const config = await paymentConfigService.findOne(filter, options, [
        { path: 'entityId', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(config, 'PaymentConfig retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to populate references
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = paymentConfigService.generateFilter({
        filters: reqData,
      });

      const configs = await paymentConfigService.findAll(filter, options, [
        { path: 'entityId', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(configs, 'PaymentConfigs retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to populate references
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = paymentConfigService.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await paymentConfigService.findAllWithPagination(filter, options, [
        { path: 'entityId', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(paginationData, 'PaymentConfigs retrieved successfully with pagination'));
    } catch (error) {
      next(error);
    }
  };


  async setConfig(req: Request, res: Response) {
    try {
      const { entityType, entityId, ...config } = req.body;
      
      const paymentConfig = await paymentConfigService.setPaymentConfig(
        entityType,
        entityId,
        config
      );

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(paymentConfig, 'Payment configuration saved successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getConfig(req: Request, res: Response) {
    try {
      const { entityType, entityId } = req.query;

      const config = await paymentConfigService.getPaymentConfig(
        entityType as 'CATEGORY' | 'PRODUCT',
        entityId as string
      );

      if (!config) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          success: false,
          message: 'Payment configuration not found',
        });
      }

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(config));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEffectiveConfig(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const config = await paymentConfigService.getEffectivePaymentConfig(productId);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(config));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const paymentConfigController = new PaymentConfigController();
