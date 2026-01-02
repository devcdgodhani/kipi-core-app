import { CouponModel } from '../../db/mongodb/models/couponModel';
import { ICouponAttributes, ICouponDocument, COUPON_STATUS } from '../../interfaces/coupon';
import { ICouponService } from '../contracts/couponServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { COUPON_ERROR_MESSAGES } from '../../constants/coupon';

export class CouponService
  extends MongooseCommonService<ICouponAttributes, ICouponDocument>
  implements ICouponService
{
  constructor() {
    super(CouponModel);
  }

  async validateCoupon(code: string, orderAmount: number, userId?: string | string[]): Promise<ICouponDocument> {
    const coupon = await this.findOne({ 
      code: code.toUpperCase(), 
      status: COUPON_STATUS.ACTIVE,
      deletedAt: { $exists: false } 
    });

    if (!coupon) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, COUPON_ERROR_MESSAGES.INVALID);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, COUPON_ERROR_MESSAGES.EXPIRED);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, COUPON_ERROR_MESSAGES.USAGE_LIMIT_REACHED);
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, COUPON_ERROR_MESSAGES.MIN_ORDER_NOT_MET);
    }

    // Check if restricted to certain users
    if (coupon.userIds && coupon.userIds.length > 0 && userId) {
      const userList = Array.isArray(userId) ? userId : [userId];
      const couponUserIds = coupon.userIds.map(id => String(id));
      const isAllowed = userList.some(id => couponUserIds.includes(String(id)));
      if (!isAllowed) {
        throw new ApiError(HTTP_STATUS_CODE.FORBIDDEN.CODE, HTTP_STATUS_CODE.FORBIDDEN.STATUS, 'Coupon not valid for this user');
      }
    }

    return coupon;
  }
}
