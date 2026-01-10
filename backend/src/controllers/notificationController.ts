import { NextFunction, Request, Response } from 'express';
import { notificationService } from '../services/concrete/notificationService';
import { HTTP_STATUS_CODE, NOTIFICATION_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { INotificationAttributes } from '../interfaces/notification';
import { TNotificationListPaginationRes, TNotificationListRes, TNotificationRes, TUnreadCountRes } from '../types/notification';

export class NotificationController {
  private get notificationService() { return notificationService; }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.notificationService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const response = await this.notificationService.findAll(filter);

      const apiResponse: TNotificationListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.notificationService.generateFilter({
        filters: req.body,
      });
      const response = await this.notificationService.findOne(filter);

      const apiResponse: TNotificationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
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
      
      const { filter, options } = this.notificationService.generateFilter({
        filters: reqData,
      });
      const response = await this.notificationService.findAllWithPagination(filter, options);

      const apiResponse: TNotificationListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.notificationService.create(req.body, { userId: req.user?._id });

      const apiResponse: TNotificationRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.updateOne({ _id: req.params.id } as any, req.body, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.notificationService.generateFilter({
        filters: req.body,
      });
      await this.notificationService.softDelete(filter, { userId: req.user?._id });

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  // Custom methods for customer app
  getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: any = { ...req.query, ...req.body };
      const userId = req.user?._id;

      const { filter, options } = this.notificationService.generateFilter({
        filters: { ...reqData, userId, status: 'ACTIVE' },
      });

      const response = await this.notificationService.findAllWithPagination(filter, {
        ...options,
        sort: { createdAt: -1 },
      });

      const apiResponse: TNotificationListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const count = await this.notificationService.getUnreadCount(userId);

      const apiResponse: TUnreadCountRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: { count },
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationIds } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await this.notificationService.markAsRead(notificationIds, userId);

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.MARK_READ_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id?.toString();

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await this.notificationService.markAllAsRead(userId);

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: NOTIFICATION_SUCCESS_MESSAGES.MARK_ALL_READ_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const notificationController = new NotificationController();
