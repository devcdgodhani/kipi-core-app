import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { WhatsAppMessageService } from '../services/concrete/whatsAppMessageService';
import { IApiResponse, IPaginationData, IWhatsAppMessageAttributes } from '../interfaces';

export default class WhatsAppMessageController {
  messageService = new WhatsAppMessageService();

  constructor() {}

  /*********** Fetch messages ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const message = await this.messageService.findById(id);

      if (!message) {
          throw new Error('Message not found');
      }

      const response: IApiResponse<IWhatsAppMessageAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: message,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.messageService.generateFilter({
        filters: reqData,
      });

      const messageList = await this.messageService.findAll(filter, options);

      const response: IApiResponse<IWhatsAppMessageAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: messageList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.messageService.generateFilter({
        filters: reqData,
      });

      const messageList = await this.messageService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWhatsAppMessageAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: messageList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create messages (Internal/Manual) ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messageData = req.body;
      const newMessage = await this.messageService.create(messageData); // calls create, but service has specific createMessage with jobId. 
      // MongooseCommonService create matches IModel, but specific logic might be needed.
      // For now, using standard create from common service unless we need the wrapper.
      // Actually, standard create works if body has all fields.

      const response: IApiResponse<IWhatsAppMessageAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newMessage,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update messages ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedMessage = await this.messageService.update({ _id: id } as any, updateData);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedMessage
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete messages ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.messageService.generateFilter({
        filters: reqData,
      });
      if (Object.keys(filter).length === 0 && !reqData.confirmDeleteAll) {
           throw new Error('Filter required or confirmDeleteAll=true');
      }

      await this.messageService.deleteMany(filter);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
