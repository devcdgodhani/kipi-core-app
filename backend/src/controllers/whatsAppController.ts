import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { WhatsAppService } from '../services/concrete/whatsAppService';
import { IApiResponse, IPaginationData, IWhatsAppSessionAttributes } from '../interfaces';
import { ApiError } from '../helpers';

export default class WhatsAppController {
  private whatsAppService = new WhatsAppService();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.query;
      const session = await this.whatsAppService.findOne({ _id: id });
      const response: IApiResponse<IWhatsAppSessionAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: session,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await this.whatsAppService.findAll({});
      const response: IApiResponse<IWhatsAppSessionAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: sessions,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter, options } = this.whatsAppService.generateFilter({
        filters: reqData,
      });

      const sessionList = await this.whatsAppService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWhatsAppSessionAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: sessionList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      reqData.externalId = `session-${Date.now()}`;
      const session = await this.whatsAppService.create(reqData);
      
      // Auto start after creation
      await this.whatsAppService.startClient(session);

      const response: IApiResponse<IWhatsAppSessionAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: session,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user._id;
      
      await this.whatsAppService.updateOne({ _id: id }, updateData, { userId });
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      await this.whatsAppService.deleteSessionWithClient(id);
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  // WhatsApp Specific
  initializeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const session = await this.whatsAppService.findOne({ _id: id });
      if (!session) throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 'Session not found');
      
      await this.whatsAppService.startClient(session);
      
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.INITIALIZE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  logoutSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      await this.whatsAppService.logoutSession(id);
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, to, message } = req.body;
      const result = await this.whatsAppService.sendMessage(sessionId, to, message);
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.MESSAGE_SENT,
        data: result,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  sendBulkMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, numbers, message } = req.body;
      const results = await this.whatsAppService.sendBulkMessage(sessionId, numbers, message);
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.BULK_MESSAGE_SENT,
        data: results,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };
}
