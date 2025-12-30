import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/concrete';
import { HTTP_STATUS_CODE } from '../constants';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { IInventory, IInventoryAttributes } from '../interfaces';

export class InventoryController extends BaseController<IInventoryAttributes, IInventory> {
  constructor() {
    super(inventoryService, 'Inventory');
  }

  // Override getOne to populate references
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = inventoryService.generateFilter({
        filters: reqData,
      });

      const inventory = await inventoryService.findOne(filter, options, [
        {
          path: 'sku',
          populate: { path: 'product', select: 'name sku brand' }
        }
      ]);

      return res.status(200).json(successResponse(inventory, 'Inventory retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to populate references
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = inventoryService.generateFilter({
        filters: reqData,
      });

      const inventories = await inventoryService.findAll(filter, options, [
        {
          path: 'sku',
          populate: { path: 'product', select: 'name sku brand' }
        }
      ]);

      return res.status(200).json(successResponse(inventories, 'Inventories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to populate references
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = inventoryService.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await inventoryService.findAllWithPagination(filter, options, [
        {
          path: 'sku',
          populate: { path: 'product', select: 'name sku brand' }
        }
      ]);

      return res.status(200).json(successResponse(paginationData, 'Inventories retrieved successfully with pagination'));
    } catch (error) {
      next(error);
    }
  };


  // Override getAll if needed, but base should work if inventoryService has findAll
  // inventoryService.getAll seems to be a custom wrapper in the original code.
  // We'll keep the specialized methods.

  async getStock(req: Request, res: Response) {
    try {
      const stock = await inventoryService.getStock(req.params.skuId);
      if (!stock) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          success: false,
          message: 'Stock not found for this SKU',
        });
      }

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(stock));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const { skuId, quantity, reason, lotId } = req.body;
      const userId = (req as any).user?._id;

      const inventory = await inventoryService.adjustStock(
        skuId,
        quantity,
        reason,
        lotId,
        userId
      );

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(inventory, 'Stock adjusted successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async reserveStock(req: Request, res: Response) {
    try {
      const { skuId, quantity } = req.body;
      const userId = (req as any).user?._id;

      const inventory = await inventoryService.reserveStock(skuId, quantity, userId);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(inventory, 'Stock reserved successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async releaseStock(req: Request, res: Response) {
    try {
      const { skuId, quantity } = req.body;

      const inventory = await inventoryService.releaseStock(skuId, quantity);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(inventory, 'Stock released successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getLowStockItems(req: Request, res: Response) {
    try {
      const items = await inventoryService.getLowStockItems();
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(items));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateThreshold(req: Request, res: Response) {
    try {
      const { skuId, threshold } = req.body;

      const inventory = await inventoryService.updateStockThreshold(skuId, threshold);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(inventory, 'Stock threshold updated successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getStockValue(req: Request, res: Response) {
    try {
      const value = await inventoryService.getStockValue();
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(value));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const inventoryController = new InventoryController();
