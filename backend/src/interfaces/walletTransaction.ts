import { Document, ObjectId } from 'mongoose';
import { 
  WALLET_TRANSACTION_TYPE, 
  WALLET_SOURCE_TYPE, 
  WALLET_TRANSACTION_STATUS, 
  WALLET_CREATED_BY 
} from '../constants/walletTransaction';
import { IDefaultAttributes } from './common';

export interface IWalletTransactionAttributes extends IDefaultAttributes {
  _id: ObjectId;
  walletId: ObjectId;
  userId: ObjectId;
  transactionType: WALLET_TRANSACTION_TYPE;
  sourceType: WALLET_SOURCE_TYPE;
  sourceReferenceId?: ObjectId;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: WALLET_TRANSACTION_STATUS;
  expiryDate?: Date;
  metadata?: any;
  description: string;
  createdByType: WALLET_CREATED_BY;
  adminUserId?: ObjectId;
}

export interface IWalletTransactionDocument extends Omit<IWalletTransactionAttributes, '_id'>, Document {}
