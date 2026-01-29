import { NextFunction, Request, Response } from 'express';
import { themeService } from '../services/concrete/themeService';
import { HTTP_STATUS_CODE, PRODUCT_SUCCESS_MESSAGES } from '../constants';
import { THEME_SUCCESS_MESSAGES } from '../constants/theme';
import { IApiResponse, IPaginationData } from '../interfaces';
import { TThemeListPaginationRes, TThemeListRes, TThemeRes } from '../types/theme';

export class ThemeController {
  private get themeService() { return themeService; }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const theme = await this.themeService.create(req.body);
      const apiResponse: TThemeRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: THEME_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: theme,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.themeService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const result = await this.themeService.findAll(filter);
      
      const apiResponse: TThemeListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: THEME_SUCCESS_MESSAGES.GET_SUCCESS,
        data: result,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getThemeByAppName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { appName } = req.params;
      const theme = await this.themeService.getThemeByAppName(appName);
      
      const apiResponse: TThemeRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: THEME_SUCCESS_MESSAGES.GET_SUCCESS,
        // @ts-ignore
        data: theme, 
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateThemeByAppName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { appName } = req.params;
      const theme = await this.themeService.updateThemeByAppName(appName, req.body);
      
      const apiResponse: TThemeRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: THEME_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        // @ts-ignore
        data: theme,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { filter } = this.themeService.generateFilter({
            filters: req.body,
        });
        const theme = await this.themeService.findOne(filter);
        const apiResponse: TThemeRes = {
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: THEME_SUCCESS_MESSAGES.GET_SUCCESS,
            // @ts-ignore
            data: theme,
        };
        res.status(apiResponse.status).json(apiResponse);
      } catch (err) {
          next(err);
      }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const theme = await this.themeService.update({ _id: req.params.id }, req.body);
        const apiResponse: IApiResponse = {
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: THEME_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        };
        res.status(apiResponse.status).json(apiResponse);
      } catch (err) {
          next(err);
      }
  };
  
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { filter } = this.themeService.generateFilter({
            filters: req.body,
        });
        const theme = await this.themeService.delete(filter);
        const apiResponse: IApiResponse = {
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: THEME_SUCCESS_MESSAGES.DELETE_SUCCESS,
        };
        res.status(apiResponse.status).json(apiResponse);
      } catch (err) {
          next(err);
      }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const reqData: any = { ...req.query, ...req.body };
        
        if (reqData.sortBy) {
            const sortOrder = reqData.sortOrder === 'asc' ? 1 : -1;
            reqData.order = { [reqData.sortBy]: sortOrder };
            delete reqData.sortBy;
            delete reqData.sortOrder;
        }

        const { filter, options } = this.themeService.generateFilter({
            filters: reqData,
        });

        const result = await this.themeService.findAllWithPagination(filter, options);
        const apiResponse: TThemeListPaginationRes = {
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: THEME_SUCCESS_MESSAGES.GET_SUCCESS,
            data: result,
        };
        res.status(apiResponse.status).json(apiResponse);
      } catch (err) {
          next(err);
      }
  };
}

export const themeController = new ThemeController();
