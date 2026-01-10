import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { whatsAppSystemService } from '../services/concrete/whatsAppSystemService';

export class WhatsAppSystemController {
  private get systemService() { return whatsAppSystemService; }

  constructor() {}

  getQueueStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.systemService.getQueueStatus();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: status,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  retryFailedJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.systemService.retryFailedJobs();
      const response: IApiResponse<any> = {
          status: HTTP_STATUS_CODE.OK.STATUS,
          code: HTTP_STATUS_CODE.OK.CODE,
          message: `Retried ${count} jobs`,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  cleanQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, limit } = req.body;
      const count = await this.systemService.cleanQueue(status, limit);
      const response: IApiResponse<any> = {
          status: HTTP_STATUS_CODE.OK.STATUS,
          code: HTTP_STATUS_CODE.OK.CODE,
          message: `Cleaned ${count} jobs`,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
  
  clearQueue = async (req: Request, res: Response, next: NextFunction) => {
      try {
          await this.systemService.clearQueue();
          const response: IApiResponse<any> = {
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Queue cleared',
          };
          return res.status(response.status).json(response);
      } catch (err) {
          return next(err);
      }
  };

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const queueStatus = await this.systemService.getQueueStatus();
          
          const response: IApiResponse<any> = {
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
              data: {
                  queue: queueStatus
              }
          };
          return res.status(response.status).json(response);
      } catch (err) {
          return next(err);
      }
  };

  pause = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.systemService.pauseQueue();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'WhatsApp message processing paused',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  resume = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.systemService.resumeQueue();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'WhatsApp message processing resumed',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  resetCounters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.systemService.resetCounters();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Daily and hourly counters reset successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}

export const whatsAppSystemController = new WhatsAppSystemController();
