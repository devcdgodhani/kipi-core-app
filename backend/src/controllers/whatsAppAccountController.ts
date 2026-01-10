import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { whatsAppAccountService } from '../services/concrete/whatsAppAccountService';
import { IApiResponse, IPaginationData, IWhatsAppAccountAttributes } from '../interfaces';

export default class WhatsAppAccountController {
  whatsAppAccountService = whatsAppAccountService;

  constructor() {}

  /*********** Fetch accounts ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const account = await this.whatsAppAccountService.findById(id);

      if (!account) {
          throw new Error('Account not found');
      }

      const response: IApiResponse<IWhatsAppAccountAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: account,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.whatsAppAccountService.generateFilter({
        filters: reqData,
      });

      const accountList = await this.whatsAppAccountService.findAll(filter, options);

      const response: IApiResponse<IWhatsAppAccountAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: accountList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.whatsAppAccountService.generateFilter({
        filters: reqData,
      });

      const accountList = await this.whatsAppAccountService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWhatsAppAccountAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: accountList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create accounts ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountData = req.body;
      const newAccount = await this.whatsAppAccountService.create({
          ...accountData,
          externalId: `client-${Date.now()}`,
          socketStatus: 'DISCONNECTED',
          status: 'ACTIVE',
          isAuthenticated: false,
          sentToday: 0,
          sentThisHour: 0,
          riskScore: 0,
          metadata: { totalSent: 0, totalFailed: 0, totalReplies: 0 }
      });

      const response: IApiResponse<IWhatsAppAccountAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newAccount,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update accounts ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedAccount = await this.whatsAppAccountService.update({ _id: id } as any, updateData);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedAccount
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete accounts ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.whatsAppAccountService.generateFilter({
        filters: reqData,
      });
      // Safety: Prevent deleting all if filter empty
      if (Object.keys(filter).length === 0 && !reqData.confirmDeleteAll) {
           throw new Error('Filter required or confirmDeleteAll=true');
      }

      await this.whatsAppAccountService.deleteMany(filter);

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

  /** Specific Actions */
  initialize = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { id } = req.params;
          const account = await this.whatsAppAccountService.findById(id);
          if (!account) throw new Error('Account not found');
          await this.whatsAppAccountService.initializeSession(id);
          
          return res.status(200).json({
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Account initialized',
          });
      } catch (err) {
          return next(err);
      }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.whatsAppAccountService.logoutSession(id);
        return res.status(200).json({
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: 'Account logged out',
        });
    } catch (err) {
        return next(err);
    }
  };

  terminate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.whatsAppAccountService.terminateSession(id);
        return res.status(200).json({
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: 'Account client terminated',
        });
    } catch (err) {
        return next(err);
    }
  };
  
  pause = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.whatsAppAccountService.pauseAccount(id);
        return res.status(200).json({ status: HTTP_STATUS_CODE.OK.STATUS, code: HTTP_STATUS_CODE.OK.CODE, message: 'Account paused' });
    } catch (err) { return next(err); }
  };

  resume = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.whatsAppAccountService.resumeAccount(id);
        return res.status(200).json({ status: HTTP_STATUS_CODE.OK.STATUS, code: HTTP_STATUS_CODE.OK.CODE, message: 'Account resumed' });
    } catch (err) { return next(err); }
  };
  
  disable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.whatsAppAccountService.disableAccount(id);
        return res.status(200).json({ status: HTTP_STATUS_CODE.OK.STATUS, code: HTTP_STATUS_CODE.OK.CODE, message: 'Account disabled' });
    } catch (err) { return next(err); }
  };

  /** Messaging Actions */
  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { id } = req.params;
          const { to, message, templateId } = req.body;
          // Use enqueueMessage for cleaner handling
          const account = await this.whatsAppAccountService.findById(id);
          if (!account) throw new Error('Account not found');

          await this.whatsAppAccountService.enqueueMessage(id, to, { message, templateId });
          
          return res.status(200).json({
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Message enqueued',
              data: { jobId: 'queued' } // Job ID not returned by contract
          });
      } catch (err) {
          return next(err);
      }
  };

  sendBulkMessage = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { recipients, templateId } = req.body; // recipients: [{ mobile, message }]
          
          const jobIds = await this.whatsAppAccountService.enqueueMessages(recipients, { templateId });

          return res.status(200).json({
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: `Enqueued ${jobIds.length} messages`,
              data: { jobIds }
          });
      } catch (err) {
          return next(err);
      }
  };

  sendLoadBalancedMessage = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { to, message, templateId } = req.body;
          
          const jobId = await this.whatsAppAccountService.enqueueBestEffortMessage(to, message, { templateId });

          return res.status(200).json({
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Message enqueued',
              data: { jobId }
          });
      } catch (err) {
          return next(err);
      }
  };
}
