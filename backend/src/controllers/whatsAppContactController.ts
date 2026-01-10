import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WHATSAPP_SUCCESS_MESSAGES } from '../constants';
import { WhatsAppContactService } from '../services/concrete/whatsAppContactService';
import { IApiResponse, IPaginationData, IWhatsAppContactAttributes } from '../interfaces';

export default class WhatsAppContactController {
  contactService = new WhatsAppContactService();

  constructor() {}

  /*********** Fetch contacts ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contact = await this.contactService.findById(id);

      if (!contact) {
          throw new Error('Contact not found');
      }

      const response: IApiResponse<IWhatsAppContactAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: contact,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.contactService.generateFilter({
        filters: reqData,
      });

      const contactList = await this.contactService.findAll(filter, options);

      const response: IApiResponse<IWhatsAppContactAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: contactList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.contactService.generateFilter({
        filters: reqData,
      });

      const contactList = await this.contactService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWhatsAppContactAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.GET_SUCCESS,
        data: contactList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create contacts ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactData = req.body;
      const newContact = await this.contactService.create(contactData);

      const response: IApiResponse<IWhatsAppContactAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newContact,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update contacts ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedContact = await this.contactService.update({ _id: id } as any, updateData);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WHATSAPP_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        data: updatedContact
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete contacts ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.contactService.generateFilter({
        filters: reqData,
      });
      if (Object.keys(filter).length === 0 && !reqData.confirmDeleteAll) {
           throw new Error('Filter required or confirmDeleteAll=true');
      }

      await this.contactService.deleteMany(filter);

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
  updateConsent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { consent } = req.body;
        await this.contactService.updateConsent(id, consent);
        return res.status(200).json({ status: HTTP_STATUS_CODE.OK.STATUS, code: HTTP_STATUS_CODE.OK.CODE, message: 'Consent updated' });
    } catch (err) { return next(err); }
  };

  markAsDND = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await this.contactService.markAsDND(id);
        return res.status(200).json({ status: HTTP_STATUS_CODE.OK.STATUS, code: HTTP_STATUS_CODE.OK.CODE, message: 'Marked as DND' });
    } catch (err) { return next(err); }
  };
}
