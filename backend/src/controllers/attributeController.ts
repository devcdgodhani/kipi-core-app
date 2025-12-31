import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, ATTRIBUTE_SUCCESS_MESSAGES } from '../constants';
import { AttributeService } from '../services/concrete/attributeService';
import { IApiResponse, IPaginationData, IAttributeAttributes } from '../interfaces';
import slugify from 'slugify';

export default class AttributeController {
  attributeService = new AttributeService();

  constructor() {}

  /*********** Fetch attributes ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.attributeService.generateFilter({
        filters: reqData,
      });

      const attribute = await this.attributeService.findOne(filter, options);

      const response: IApiResponse<IAttributeAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: attribute,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.attributeService.generateFilter({
        filters: reqData,
      });

      const attributeList = await this.attributeService.findAll(filter, options);

      const response: IApiResponse<IAttributeAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: attributeList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.attributeService.generateFilter({
        filters: reqData,
      });

      const attributeList = await this.attributeService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IAttributeAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: attributeList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create attributes ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attributeData = req.body;
      
      // Auto-generate slug if not provided
      if (!attributeData.slug && attributeData.name) {
        attributeData.slug = slugify(attributeData.name, { lower: true });
      }

      const newAttribute = await this.attributeService.create(attributeData, { userId: req.user?._id });

      const response: IApiResponse<IAttributeAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newAttribute,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update attributes ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Auto-generate slug if name is being updated
      if (updateData.name && !updateData.slug) {
        updateData.slug = slugify(updateData.name, { lower: true });
      }

      await this.attributeService.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete attributes ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.attributeService.generateFilter({
        filters: reqData,
      });

      await this.attributeService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ATTRIBUTE_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
