
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';

export abstract class BaseController<T, TDoc> {
  protected service: any;
  protected modelName: string;

  constructor(service: any, modelName: string) {
    this.service = service;
    this.modelName = modelName;
  }

  /*********** Fetch data ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body,...req.params };
      const { filter, options } = this.service.generateFilter({
        filters: reqData,
      });

      const data = await this.service.findOne(filter, options);

      const response: IApiResponse<T | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName} retrieved successfully`,
        data: data,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.service.generateFilter({
        filters: reqData,
      });

      const list = await this.service.findAll(filter, options);

      const response: IApiResponse<T[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName}s retrieved successfully`,
        data: list,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.service.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await this.service.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<T>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName}s retrieved successfully with pagination`,
        data: paginationData,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.create(req.body, { userId: (req as any).user?._id });
      const response = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: `${this.modelName} created successfully`,
        data: data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.bulkCreate(req.body, { userId: (req as any).user?._id });
      const response = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: `${this.modelName}s created successfully`,
        data: data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update ***********/
  updateManyByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let reqData = req.body;
      if (!Array.isArray(reqData)) reqData = [reqData];
      for (const updateData of reqData) {
        const { filter } = this.service.generateFilter({
          filters: updateData.filter,
        });
        await this.service.update(filter, updateData.update, { userId: (req as any).user?._id });
      }
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName}s updated successfully`,
        data: undefined
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateOneByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.service.generateFilter({
        filters: reqData.filter,
      });
      await this.service.updateOne(filter, reqData.update, { userId: (req as any).user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName} updated successfully`,
        data: undefined
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.service.generateFilter({
        filters: reqData,
      });

      await this.service.softDelete(filter, { userId: (req as any).user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName} deleted successfully`,
        data: undefined
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id } = req.params;
      const data = await this.service.updateById(_id, req.body);
      const response = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName} updated successfully`,
        data: data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.service.deleteById(id);
      const response = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `${this.modelName} deleted successfully`,
        data: undefined
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
