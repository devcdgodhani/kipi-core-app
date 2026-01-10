import { Document, ObjectId } from 'mongoose';
import { FLASH_DEAL_STATUS, FLASH_DEAL_DISCOUNT_TYPE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IFlashDealAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  description?: string;
  productIds: ObjectId[];
  discountType: FLASH_DEAL_DISCOUNT_TYPE;
  discountValue: number;
  startTime: Date;
  endTime: Date;
  maxQuantityPerUser?: number;
  totalQuantityLimit?: number;
  currentQuantitySold: number;
  status: FLASH_DEAL_STATUS;
}

export interface IFlashDealDocument extends Omit<IFlashDealAttributes, '_id'>, Document {}
