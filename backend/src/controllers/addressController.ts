import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { AddressService } from '../services/concrete/addressService';
import { IApiResponse, IPaginationData, IAddressAttributes } from '../interfaces';

const ADDRESS_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Address retrieved successfully',
  CREATE_SUCCESS: 'Address created successfully',
  UPDATE_SUCCESS: 'Address updated successfully',
  DELETE_SUCCESS: 'Address deleted successfully',
};

export default class AddressController {
  addressService = new AddressService();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.addressService.generateFilter({ filters: reqData });
      const address = await this.addressService.findOne(filter, options);

      const response: IApiResponse<IAddressAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: address,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.addressService.generateFilter({ filters: reqData });
      const addressList = await this.addressService.findAll(filter, options);

      const response: IApiResponse<IAddressAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: addressList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.addressService.generateFilter({ filters: reqData });
      const addressList = await this.addressService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IAddressAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.GET_SUCCESS,
        data: addressList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const addressData = req.body;
      const newAddress = await this.addressService.create(addressData, { userId: req.user?._id });

      const response: IApiResponse<IAddressAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newAddress,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await this.addressService.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.addressService.generateFilter({ filters: reqData });
      await this.addressService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: ADDRESS_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
