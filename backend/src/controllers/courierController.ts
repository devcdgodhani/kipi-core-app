import { Request, Response, NextFunction } from 'express';
import { courierService } from '../services/concrete/courierService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class CourierController {
  
  /*********** Get One (Standard) ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query, ...req.body };
      
      let courier;
      if (id) {
        courier = await courierService.findById(id);
      } else {
        const { filter, options } = courierService.generateFilter({
          filters: reqData,
        });
        courier = await courierService.findOne(filter, options);
      }
      
      if (!courier) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Courier not found'
        });
      }

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Courier fetched successfully',
        data: courier
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get All (Standard) ***********/
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = courierService.generateFilter({
        filters: reqData,
      });

      const courierList = await courierService.findAll(filter, options);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'All couriers fetched successfully',
        data: courierList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get With Pagination (Standard) ***********/
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = courierService.generateFilter({
        filters: reqData,
      });

      const courierList = await courierService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<any>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Couriers fetched successfully',
        data: courierList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create (Standard) ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await courierService.create(data, { userId: req.user?._id });

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Courier created successfully',
        data: result,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update By ID (Standard) ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?._id;

      await courierService.updateOne({ _id: id } as any, updateData, { userId });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Courier updated successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete By Filter (Standard) ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = courierService.generateFilter({
        filters: reqData,
      });

      await courierService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Courier(s) deleted successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Toggle Active Status ***********/
  toggleActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await courierService.toggleActive(id, isActive);
      
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Courier status updated successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
