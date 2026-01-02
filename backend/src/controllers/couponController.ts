import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, COUPON_SUCCESS_MESSAGES } from '../constants';
import { CouponService } from '../services/concrete/couponService';
import { IApiResponse, IPaginationData, ICouponAttributes } from '../interfaces';

export default class CouponController {
  private couponService = new CouponService();

  constructor() {}

  /*********** Fetch Coupons ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = this.couponService.generateFilter({
        filters: reqData,
      });

      const coupon = await this.couponService.findOne(filter, options);

      const response: IApiResponse<ICouponAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.GET_SUCCESS,
        data: coupon,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.couponService.generateFilter({
        filters: reqData,
      });

      const couponList = await this.couponService.findAll(filter, options);

      const response: IApiResponse<ICouponAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.GET_SUCCESS,
        data: couponList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.couponService.generateFilter({
        filters: reqData,
      });

      const couponList = await this.couponService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<ICouponAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.GET_SUCCESS,
        data: couponList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create Coupons ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const couponData = req.body;
      const newCoupon = await this.couponService.create(couponData, { userId: req.user?._id });

      const response: IApiResponse<ICouponAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: COUPON_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newCoupon,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Coupons ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await this.couponService.updateOne({ _id: id }, updateData, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete Coupons ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.couponService.generateFilter({
        filters: reqData,
      });

      await this.couponService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Customer: Apply Coupon ***********/
  apply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, orderAmount } = req.body;
      const userId = req.user?._id ? String(req.user._id) : undefined;

      const coupon = await this.couponService.validateCoupon(code, orderAmount, userId);

      const response: IApiResponse<ICouponAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: COUPON_SUCCESS_MESSAGES.APPLY_SUCCESS,
        data: coupon,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
