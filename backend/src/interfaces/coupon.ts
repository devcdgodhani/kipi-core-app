import { Document, Types } from 'mongoose';
import { DISCOUNT_TYPE, COUPON_APPLICABILITY } from '../constants';

export interface ICouponAttributes {
  code: string;
  description?: string;
  discountType: DISCOUNT_TYPE;
  discountValue: number;
  applicability: COUPON_APPLICABILITY;
  applicableCategories?: Types.ObjectId[];
  applicableProducts?: Types.ObjectId[];
  minCartValue?: number;
  maxDiscountCap?: number;
  userSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  festivalEvent?: string;
  dayTimeRestrictions?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  currentUsageCount: number;
  canStackWithOthers: boolean;
  priority: number;
  isActive: boolean;
  autoApply?: boolean;
}

export interface ICoupon extends Document, ICouponAttributes {}
