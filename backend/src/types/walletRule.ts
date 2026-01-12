import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IWalletRuleAttributes } from '../interfaces/walletRule';

export type TWalletRuleRes = IApiResponse<IWalletRuleAttributes>;
export type TWalletRuleListRes = IApiResponse<IWalletRuleAttributes[]>;
export type TWalletRuleListPaginationRes = IPaginationApiResponse<IWalletRuleAttributes>;

export type TCreateWalletRuleReq = {
  name: string;
  description?: string;
  ruleType: string;
  valueType: string;
  value: number;
  minOrderAmount?: number;
  maxCashbackAmount?: number;
  expiryDays?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: number;
  metadata?: any;
};

export type TUpdateWalletRuleReq = Partial<TCreateWalletRuleReq>;

export type TCalculateCashbackReq = {
  orderAmount: number;
  ruleType?: string;
};

export type TCalculateCashbackRes = {
  cashbackAmount: number;
  appliedRule: IWalletRuleAttributes | null;
  expiryDate: Date | null;
};
