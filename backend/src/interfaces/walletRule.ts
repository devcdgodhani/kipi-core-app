import { Document, ObjectId } from 'mongoose';
import { WALLET_RULE_TYPE, WALLET_RULE_VALUE_TYPE, WALLET_RULE_STATUS } from '../constants/walletRule';
import { IDefaultAttributes } from './common';

export interface IWalletRuleAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  description?: string;
  ruleType: WALLET_RULE_TYPE;
  valueType: WALLET_RULE_VALUE_TYPE;
  value: number;
  minOrderAmount?: number;
  maxCashbackAmount?: number;
  expiryDays?: number;
  startDate?: Date;
  endDate?: Date;
  status: WALLET_RULE_STATUS;
  priority: number;
  metadata?: any;
}

export interface IWalletRuleDocument extends Omit<IWalletRuleAttributes, '_id'>, Document {}
