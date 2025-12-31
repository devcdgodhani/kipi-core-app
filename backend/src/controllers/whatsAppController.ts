import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { WhatsAppService } from '../services/concrete/whatsAppService';
import { IApiResponse, IPaginationData, IWhatsAppSessionAttributes } from '../interfaces';
import { ApiError } from '../helpers';
import { 
  TWhatsAppSessionCreateReq, 
  TWhatsAppSessionUpdateReq, 
  TWhatsAppSessionRes, 
  TWhatsAppSessionListRes, 
  TWhatsAppSessionListPaginationRes,
  TWhatsAppSendMessageReq,
  TWhatsAppSendBulkMessageReq
} from '../types/whatsAppSession';

export default class WhatsAppController {
  private whatsAppService = new WhatsAppService();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.whatsAppService.generateFilter({
        filters: reqData,
      });

      const session = await this.whatsAppService.findOne(filter, options);
      const response: TWhatsAppSessionRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: session as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.whatsAppService.generateFilter({
        filters: reqData,
      });

      const sessions = await this.whatsAppService.findAll(filter, options);
      const response: TWhatsAppSessionListRes = {
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
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.whatsAppService.generateFilter({
        filters: reqData,
      });

      const sessionList = await this.whatsAppService.findAllWithPagination(filter, options);

      const response: TWhatsAppSessionListPaginationRes = {
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
      const reqData: TWhatsAppSessionCreateReq = req.body;
      const createData: any = { ...reqData, externalId: `session-${Date.now()}` };
      const session = await this.whatsAppService.create(createData, { userId: req.user?._id });
      
      // Auto start after creation
      await this.whatsAppService.startClient(session);

      const response: TWhatsAppSessionRes = {
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
      const updateData: TWhatsAppSessionUpdateReq = req.body;
      
      await this.whatsAppService.updateOne({ _id: id }, updateData as any, { userId: req.user._id });
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
      const reqData = req.body;
      const { filter } = this.whatsAppService.generateFilter({
        filters: reqData,
      });

      // Special handling if id is passed in body but generateFilter didn't map it correctly if it's not in schema
      // But WhatsAppSession schema has 'id'? No, it has '_id'. generateFilter handles 'id' by mapping to '_id'.
      
      const session = await this.whatsAppService.findOne(filter);
      if (session) {
        await this.whatsAppService.deleteSessionWithClient(session._id.toString());
      }

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
      const reqData: TWhatsAppSendMessageReq = req.body;
      const result = await this.whatsAppService.sendMessage(reqData.sessionId, reqData.to, reqData.message);
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
      const reqData: TWhatsAppSendBulkMessageReq = req.body;
      const results = await this.whatsAppService.sendBulkMessage(reqData.sessionId, reqData.numbers, reqData.message);
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
