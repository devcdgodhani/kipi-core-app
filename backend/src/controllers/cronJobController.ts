import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { cronJobService } from '../services/concrete/cronJobService';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class CronJobController {
  
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = cronJobService.generateFilter({
        filters: reqData,
      });

      const data = await cronJobService.findOne(filter, options);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron job fetched successfully',
        data,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = cronJobService.generateFilter({
        filters: reqData,
      });

      const data = await cronJobService.findAll(filter, options);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron jobs fetched successfully',
        data,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = cronJobService.generateFilter({
        filters: reqData,
      });

      const data = await cronJobService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<any>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron jobs fetched successfully',
        data,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const result = await cronJobService.create(data, { userId: req.user?._id });

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Cron job created successfully',
        data: result,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await cronJobService.updateOne({ _id: id } as any, updateData, { userId: req.user._id });

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron job updated successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = cronJobService.generateFilter({
        filters: reqData,
      });

      await cronJobService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron job deleted successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  runJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier } = req.body;
      await cronJobService.runJob(identifier);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: `Job [${identifier}] execution triggered`,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const history = await cronJobService.getHistory(id);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cron job history fetched successfully',
        data: history,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
