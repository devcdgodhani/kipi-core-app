import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, LOT_SUCCESS_MESSAGES } from '../constants';
import { LotService } from '../services/concrete/lotService';
import { 
  TLotCreateReq, 
  TLotUpdateReq, 
  TLotRes, 
  TLotListRes, 
  TLotListPaginationRes 
} from '../types/lot';
import { IApiResponse } from '../interfaces';

export default class LotController {
  private lotService = new LotService();

  /*********** Fetch Lots ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.lotService.generateFilter({
        filters: reqData,
      });

      const lot = await this.lotService.findOne(filter, options);

      const response: TLotRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: LOT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: lot as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.lotService.generateFilter({
        filters: reqData,
      });

      const lots = await this.lotService.findAll(filter, options);

      const response: TLotListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: LOT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: lots as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.lotService.generateFilter({
        filters: reqData,
      });

      // User detail population requirement
      options.populate = [{ path: 'supplierId', select: 'firstName lastName email mobile' }];

      const lotList = await this.lotService.findAllWithPagination(filter, options);

      const response: TLotListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: LOT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: lotList as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create Lot ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: TLotCreateReq = req.body;
      const createData = { ...reqData, remainingQuantity: reqData.quantity };
      const newLot = await this.lotService.create(createData as any, { userId: req.user?._id });

      const response: TLotRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: LOT_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newLot as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Lot ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: TLotUpdateReq = req.body;

      await this.lotService.updateOne({ _id: id }, updateData as any, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: LOT_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete Lot ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.lotService.generateFilter({
        filters: reqData,
      });

      await this.lotService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: LOT_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
