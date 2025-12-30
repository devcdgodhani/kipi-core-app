import { Request, Response, NextFunction } from 'express';
import { lotService } from '../services/concrete';
import { HTTP_STATUS_CODE } from '../constants';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { ILot, ILotAttributes } from '../interfaces';

export class LotController extends BaseController<ILotAttributes, ILot> {
  constructor() {
    super(lotService, 'Lot');
  }

  // Override getOne to populate references
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = lotService.generateFilter({
        filters: reqData,
      });

      const lot = await lotService.findOne(filter, options, [
        { path: 'supplierId', select: 'firstName lastName email mobile' }
      ]);

      return res.status(200).json(successResponse(lot, 'Lot retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to populate references
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = lotService.generateFilter({
        filters: reqData,
      });

      const lots = await lotService.findAll(filter, options, [
        { path: 'supplierId', select: 'firstName lastName email mobile' }
      ]);

      return res.status(200).json(successResponse(lots, 'Lots retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to populate references
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = lotService.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await lotService.findAllWithPagination(filter, options, [
        { path: 'supplierId', select: 'firstName lastName email mobile' }
      ]);

      return res.status(200).json(successResponse(paginationData, 'Lots retrieved successfully with pagination'));
    } catch (error) {
      next(error);
    }
  };


  // Preserve custom methods
  async allocateFromLot(req: Request, res: Response) {
    try {
      const { quantity } = req.body;
      const userId = (req as any).user?._id;
      
      const lot = await lotService.allocateFromLot(req.params.id, quantity, userId);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(lot, 'Stock allocated successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const { quantity, reason } = req.body;
      const userId = (req as any).user?._id;
      
      const lot = await lotService.adjustLotStock(req.params.id, quantity, reason, userId);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(lot, 'Stock adjusted successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getExpiringLots(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const lots = await lotService.getExpiringLots(Number(days));
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(lots));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLotHistory(req: Request, res: Response) {
    try {
      const history = await lotService.getLotHistory(req.params.id);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(history));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const lotController = new LotController();
