import { Document, ObjectId } from 'mongoose';
import { WALLET_STATUS } from '../constants/wallet';
import { IDefaultAttributes } from './common';

export interface IWalletAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  availableBalance: number;
  blockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
  lastCalculatedAt: Date;
  status: WALLET_STATUS;
}

export interface IWalletDocument extends Omit<IWalletAttributes, '_id'>, Document {}
