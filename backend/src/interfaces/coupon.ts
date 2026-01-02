import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';
import { COUPON_STATUS, COUPON_TYPE } from '../constants/coupon';

export interface ICouponAttributes extends IDefaultAttributes {
  _id: ObjectId;
  code: string;
  description?: string;
  type: COUPON_TYPE;
  value: number; // Percentage or Flat amount
  minOrderAmount?: number;
  maxDiscountAmount?: number; // For percentage coupons
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  userIds?: ObjectId[]; // Restricted to specific users
  status: COUPON_STATUS;
}

export interface ICouponDocument extends Omit<ICouponAttributes, '_id'>, Document {
  _id: any;
}
