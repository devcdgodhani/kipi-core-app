import { Document, ObjectId } from 'mongoose';
import { LOYALTY_TRANSACTION_TYPE } from '../constants/loyalty';
import { IDefaultAttributes } from './common';

export interface ILoyaltyTransactionAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  orderId?: ObjectId; // Optional link to order
  type: LOYALTY_TRANSACTION_TYPE;
  points: number;
  balanceAfter: number; // Balance snapshot for audit
  message: string;
}

export interface ILoyaltyTransactionDocument extends Omit<ILoyaltyTransactionAttributes, '_id'>, Document {}
