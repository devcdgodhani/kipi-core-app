
import { skuService } from '../services/concrete/skuService';
import { BaseController } from './baseController';
import { ISku, ISkuAttributes } from '../interfaces';

import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../helpers';

export class SkuController extends BaseController<ISkuAttributes, ISku> {
  constructor() {
    super(skuService, 'SKU');
  }

  // Override getOne to populate references
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = skuService.generateFilter({
        filters: reqData,
      });

      const sku = await skuService.findOne(filter, options, [
        { path: 'product', select: 'name sku brand category' },
        { path: 'lotId' }
      ]);

      return res.status(200).json(successResponse(sku, 'SKU retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to populate references
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = skuService.generateFilter({
        filters: reqData,
      });

      const skus = await skuService.findAll(filter, options, [
        { path: 'product', select: 'name sku brand category' },
        { path: 'lotId' }
      ]);

      return res.status(200).json(successResponse(skus, 'SKUs retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to populate references
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = skuService.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await skuService.findAllWithPagination(filter, options, [
        { path: 'product', select: 'name sku brand category' },
        { path: 'lotId' }
      ]);

      return res.status(200).json(successResponse(paginationData, 'SKUs retrieved successfully with pagination'));
    } catch (error) {
      next(error);
    }
  };
}


export const skuController = new SkuController();
