import { NextFunction, Request, Response } from 'express';
import { customerAppSettingsService } from '../services/concrete/customerAppSettingsService';
import { HTTP_STATUS_CODE } from '../constants';
import { CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES } from '../constants/customerAppSettings';
import { TCustomerAppSettingsRes, TCustomerAppSettingsListRes, TCustomerAppSettingsListPaginationRes } from '../types/customerAppSettings';
import { IApiResponse } from '../interfaces';

export class CustomerAppSettingsController {
  private get customerAppSettingsService() { return customerAppSettingsService; }

  // Standard CRUD methods as per blueprint
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.customerAppSettingsService.create(req.body);
      const apiResponse: TCustomerAppSettingsRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: settings,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.customerAppSettingsService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const result = await this.customerAppSettingsService.findAll(filter);
      
      const apiResponse: TCustomerAppSettingsListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: result,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.customerAppSettingsService.generateFilter({
        filters: req.body,
      });
      const settings = await this.customerAppSettingsService.findOne(filter);
      const apiResponse: TCustomerAppSettingsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: settings as any,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getActiveSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.customerAppSettingsService.getActiveSettings();
      const apiResponse: TCustomerAppSettingsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: settings as any,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.customerAppSettingsService.update(
        { _id: req.params.id }, 
        req.body
      );
      const apiResponse: TCustomerAppSettingsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: settings as any,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.customerAppSettingsService.updateSettings(req.body);
      const apiResponse: TCustomerAppSettingsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: settings,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.customerAppSettingsService.generateFilter({
        filters: req.body,
      });
      await this.customerAppSettingsService.delete(filter);
      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.DELETE_SUCCESS,
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

      const { filter, options } = this.customerAppSettingsService.generateFilter({
        filters: reqData,
      });

      const result = await this.customerAppSettingsService.findAllWithPagination(filter, options);
      const apiResponse: TCustomerAppSettingsListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CUSTOMER_APP_SETTINGS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: result,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const customerAppSettingsController = new CustomerAppSettingsController();
