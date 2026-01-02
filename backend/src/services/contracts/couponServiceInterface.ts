import { ICouponAttributes, ICouponDocument } from '../../interfaces/coupon';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ICouponService extends IMongooseCommonService<ICouponAttributes, ICouponDocument> {
  validateCoupon(code: string, orderAmount: number, userId?: string | string[]): Promise<ICouponDocument>;
}
