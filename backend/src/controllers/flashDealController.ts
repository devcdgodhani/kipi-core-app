import { NextFunction, Request, Response } from 'express';
import { flashDealService } from '../services/concrete/flashDealService';
import { HTTP_STATUS_CODE, FLASH_DEAL_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { TFlashDealListPaginationRes, TFlashDealListRes, TFlashDealRes } from '../types/flashDeal';

export class FlashDealController {
  private get flashDealService() { return flashDealService; }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.flashDealService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const response = await this.flashDealService.findAll(filter, {}, [{ path: 'productIds' }]);

      const apiResponse: TFlashDealListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.flashDealService.generateFilter({
        filters: req.body,
      });
      const response = await this.flashDealService.findOne(filter, {}, [{ path: 'productIds' }]);

      const apiResponse: TFlashDealRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response || undefined,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: any = { ...req.query, ...req.body };
      
      const { filter, options } = this.flashDealService.generateFilter({
        filters: reqData,
      });
      const response = await this.flashDealService.findAllWithPagination(filter, options, [{ path: 'productIds' }]);

      const apiResponse: TFlashDealListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.flashDealService.create(req.body, { userId: req.user?._id });

      const apiResponse: TFlashDealRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.flashDealService.updateOne({ _id: req.params.id } as any, req.body, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.flashDealService.generateFilter({
        filters: req.body,
      });
      await this.flashDealService.softDelete(filter, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  // Customer endpoint for active deals
  getActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const filter = {
        status: 'ACTIVE',
        startTime: { $lte: now },
        endTime: { $gte: now },
      };

      const response = await this.flashDealService.findAll(filter, {}, [{ path: 'productIds' }]);

      const apiResponse: TFlashDealListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FLASH_DEAL_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const flashDealController = new FlashDealController();
