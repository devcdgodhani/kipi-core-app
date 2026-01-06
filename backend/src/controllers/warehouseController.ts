import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../services/concrete/warehouseService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';

export class WarehouseController {
  private warehouseService = new WarehouseService();

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, options } = this.warehouseService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const data = await this.warehouseService.findAllWithPagination(filter, options);
      
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouses fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, options } = this.warehouseService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const data = await this.warehouseService.findAll(filter, options);
      
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'All warehouses fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.createWarehouse(req.body);
      return res.status(HTTP_STATUS_CODE.CREATED.STATUS).json({
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Warehouse created successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.findById(req.params.id);
      if (!data) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Warehouse not found'
        } as IApiResponse<any>);
      }
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouse fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  getPrimary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.findPrimary();
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Primary warehouse fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.updateWarehouse(req.params.id, req.body);
      if (!data) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Warehouse not found'
        } as IApiResponse<any>);
      }
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouse updated successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };
}
