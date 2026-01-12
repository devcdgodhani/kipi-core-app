import { NextFunction, Request, Response } from 'express';
import { bannerService } from '../services/concrete/bannerService';
import { HTTP_STATUS_CODE, BANNER_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';
import { IBannerAttributes } from '../interfaces/banner';
import { TBannerListPaginationRes, TBannerListRes, TBannerRes } from '../types/banner';
import { enrichBannerWithPresignedUrls } from '../helpers';

export class BannerController {
  private get bannerService() { return bannerService; }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.bannerService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const response = await this.bannerService.findAll(filter, {}, [
        { path: 'imageId' },
        { path: 'mobileImageId' }
      ]);

      if (Array.isArray(response)) {
        await Promise.all(response.map(b => enrichBannerWithPresignedUrls(b)));
      }

      const apiResponse: TBannerListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: BANNER_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.bannerService.generateFilter({
        filters: req.body,
      });
      const response = await this.bannerService.findOne(filter, {}, [
        { path: 'imageId' },
        { path: 'mobileImageId' }
      ]);

      await enrichBannerWithPresignedUrls(response);

      const apiResponse: TBannerRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: BANNER_SUCCESS_MESSAGES.GET_SUCCESS,
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
      
      const { filter, options } = this.bannerService.generateFilter({
        filters: reqData,
      });
      const response = await this.bannerService.findAllWithPagination(
        filter,
        options,
        [
          { path: 'imageId' },
          { path: 'mobileImageId' }
        ]
      );

      if (response.recordList && Array.isArray(response.recordList)) {
        await Promise.all(response.recordList.map(b => enrichBannerWithPresignedUrls(b)));
      }

      const apiResponse: TBannerListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: BANNER_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.bannerService.create(req.body, { userId: req.user?._id });

      const apiResponse: TBannerRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: BANNER_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.bannerService.updateOne({ _id: req.params.id } as any, req.body, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: BANNER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.bannerService.generateFilter({
        filters: req.body,
      });
      await this.bannerService.softDelete(filter, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: BANNER_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const bannerController = new BannerController();
