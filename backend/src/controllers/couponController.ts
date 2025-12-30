import { NextFunction, Request, Response } from 'express';
import { couponService } from '../services/concrete';
import { HTTP_STATUS_CODE } from '../constants';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { ICoupon, ICouponAttributes } from '../interfaces';

export class CouponController extends BaseController<ICouponAttributes, ICoupon> {
  constructor() {
    super(couponService, 'Coupon');
  }

  // Override getOne to populate references
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params };
      const { filter, options } = couponService.generateFilter({
        filters: reqData,
      });

      const coupon = await couponService.findOne(filter, options, [
        { path: 'applicableCategories', select: 'name' },
        { path: 'applicableProducts', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(coupon, 'Coupon retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to populate references
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = couponService.generateFilter({
        filters: reqData,
      });

      const coupons = await couponService.findAll(filter, options, [
        { path: 'applicableCategories', select: 'name' },
        { path: 'applicableProducts', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(coupons, 'Coupons retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to populate references
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = couponService.generateFilter({
        filters: { ...reqData, isPaginate: true },
      });

      const paginationData = await couponService.findAllWithPagination(filter, options, [
        { path: 'applicableCategories', select: 'name' },
        { path: 'applicableProducts', select: 'name sku' }
      ]);

      return res.status(200).json(successResponse(paginationData, 'Coupons retrieved successfully with pagination'));
    } catch (error) {
      next(error);
    }
  };


  // Preserve specialized methods
  async validateCoupon(req: Request, res: Response) {
    try {
      const { code, cartData } = req.body;
      const result = await couponService.validateCoupon(code, cartData);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(result.coupon, result.message));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async applyCoupon(req: Request, res: Response) {
    try {
      const { code, cartData } = req.body;
      const result = await couponService.applyCoupon(code, cartData);
      if (!result.success) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json(result);
      }
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(result));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getApplicableCoupons(req: Request, res: Response) {
    try {
      const { cartData } = req.body;
      const coupons = await couponService.getApplicableCoupons(cartData);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(coupons));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getActiveCoupons(req: Request, res: Response) {
    try {
      const { applicability, discountType } = req.query;
      const filters: any = {};
      if (applicability) filters.applicability = applicability;
      if (discountType) filters.discountType = discountType;

      const coupons = await couponService.getActiveCoupons(filters);
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(coupons));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }

  async scheduleCoupon(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.body;
      const coupon = await couponService.scheduleCoupon(req.params.id, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json(successResponse(coupon, 'Coupon scheduled successfully'));
    } catch (error: any) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST.STATUS).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const couponController = new CouponController();
