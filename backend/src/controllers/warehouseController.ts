import { Request, Response, NextFunction } from 'express';
import { warehouseService } from '../services/concrete/warehouseService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';
import { IWarehouseAttributes } from '../interfaces/warehouse';

export class WarehouseController {
  private get warehouseService() { return warehouseService; }

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, options } = this.warehouseService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const data = await this.warehouseService.findAllWithPagination(filter, options);
      
      const response: IApiResponse<IPaginationData<IWarehouseAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouses fetched successfully',
        data
      };
      return res.status(response.status).json(response);
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
      
      const response: IApiResponse<IWarehouseAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'All warehouses fetched successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.createWarehouse(req.body);
      const response: IApiResponse<IWarehouseAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Warehouse created successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.warehouseService.generateFilter({
        filters: { ...req.params, ...req.query, ...req.body },
      });
      const data = await this.warehouseService.findOne(filter);
      if (!data) {
        const response: IApiResponse = {
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Warehouse not found'
        };
        return res.status(response.status).json(response);
      }
      const response: IApiResponse<IWarehouseAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouse fetched successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  getPrimary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.findPrimary();
      const response: IApiResponse<IWarehouseAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Primary warehouse fetched successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.warehouseService.updateWarehouse(req.params.id, req.body);
      if (!data) {
        const response: IApiResponse = {
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Warehouse not found'
        };
        return res.status(response.status).json(response);
      }
      const response: IApiResponse<IWarehouseAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Warehouse updated successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };
}

export const warehouseController = new WarehouseController();
