import { Request, Response, NextFunction } from 'express';
import { rtoScoreService } from '../services/concrete/rtoScoreService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';
import { TRtoScoreRes } from '../types/rto';

export class RtoScoreController {
  
  calculateScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, pincode, orderAmount, paymentMethod } = req.body;
      const result = await rtoScoreService.calculateRiskScore(userId, pincode, orderAmount, paymentMethod);
      
      const response: TRtoScoreRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Score calculated successfully',
        data: result as any
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await rtoScoreService.getStats();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Stats fetched successfully',
        data
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Standard CRUD ***********/

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = rtoScoreService.generateFilter({
        filters: reqData,
      });

      options.populate = [
        { path: 'customerId', select: 'firstName lastName email' },
        { path: 'orderId', select: 'orderNumber totalAmount' }
      ];

      const score = await rtoScoreService.findOne(filter, options);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Score fetched successfully',
        data: score,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = rtoScoreService.generateFilter({
        filters: reqData,
      });

      options.populate = [
        { path: 'customerId', select: 'firstName lastName email' },
        { path: 'orderId', select: 'orderNumber totalAmount' }
      ];

      const scores = await rtoScoreService.findAll(filter, options);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Scores fetched successfully',
        data: scores,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = rtoScoreService.generateFilter({
        filters: reqData,
      });

      options.populate = [
        { path: 'customerId', select: 'firstName lastName email' },
        { path: 'orderId', select: 'orderNumber totalAmount' }
      ];

      const scoreList = await rtoScoreService.findAllWithPagination(filter, options);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Scores fetched successfully',
        data: scoreList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = rtoScoreService.generateFilter({
        filters: reqData,
      });

      await rtoScoreService.delete(filter);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Scores deleted successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
