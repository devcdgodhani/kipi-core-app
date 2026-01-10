import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { WhatsAppRiskService } from '../services/concrete/whatsAppRiskService';
import { IApiResponse } from '../interfaces';

export default class WhatsAppRiskController {
  riskService = new WhatsAppRiskService();

  constructor() {}

  /*********** Risk Stats ***********/
  getGlobalRiskAverage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const average = await this.riskService.getGlobalRiskAverage();
      const response: IApiResponse<number> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: average,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getHighRiskAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { threshold } = req.query;
      const accounts = await this.riskService.getHighRiskAccounts(Number(threshold) || 40);
      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: accounts,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getRiskBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const breakdown = await this.riskService.getRiskBreakdown();
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: breakdown,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getRecentRiskEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query;
      const events = await this.riskService.getRecentRiskEvents(Number(limit) || 100);
       const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: events,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAccountRiskEvents = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { accountId } = req.params;
          const { limit } = req.query;
          const events = await this.riskService.getAccountRiskEvents(accountId, Number(limit) || 50);
          const response: IApiResponse<any[]> = {
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
              data: events,
          };
          return res.status(response.status).json(response);
      } catch (err) {
          return next(err);
      }
  };

  logRiskEvent = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { accountId, eventType, metadata } = req.body;
          await this.riskService.logRiskEvent(accountId, eventType, metadata);
          return res.status(200).json({
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Risk event logged',
          });
      } catch (err) {
          return next(err);
      }
  };
}
