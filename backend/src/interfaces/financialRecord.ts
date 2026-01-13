import { Document, ObjectId } from 'mongoose';
import { FINANCIAL_RECORD_STATUS, TRANSACTION_TYPE, ECOMMERCE_PLATFORM } from '../constants/financialRecord';
import { IDefaultAttributes } from './common';

export interface IFinancialRecordAttributes extends IDefaultAttributes {
  _id: ObjectId;
  transactionType: TRANSACTION_TYPE;
  subtype: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  isAutomatic: boolean;
  platform?: ECOMMERCE_PLATFORM;
  bankName?: string;
  accountNumber?: string;
  orderId?: ObjectId;
  lotId?: ObjectId;
  returnId?: ObjectId;
  walletTransactionId?: ObjectId;
  notes?: string;
  status: FINANCIAL_RECORD_STATUS;
}

export interface IFinancialRecordDocument extends Omit<IFinancialRecordAttributes, '_id'>, Document {}
