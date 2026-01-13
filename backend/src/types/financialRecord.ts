import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IFinancialRecordAttributes } from '../interfaces/financialRecord';

export type TFinancialRecordRes = IApiResponse<IFinancialRecordAttributes>;
export type TFinancialRecordListRes = IApiResponse<IFinancialRecordAttributes[]>;
export type TFinancialRecordListPaginationRes = IPaginationApiResponse<IFinancialRecordAttributes>;

export interface TFinancialRecordCreateReq {
  transactionType: string;
  subtype: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  platform?: string;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
}

export interface TFinancialRecordUpdateReq {
  transactionType?: string;
  subtype?: string;
  amount?: number;
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
  status?: string;
}

export interface TFinancialAnalytics {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  incomeBySubtype: { subtype: string; amount: number; count: number }[];
  expenseBySubtype: { subtype: string; amount: number; count: number }[];
  platformBreakdown: { platform: string; amount: number; count: number }[];
  recentTransactions: IFinancialRecordAttributes[];
}

export type TFinancialAnalyticsRes = IApiResponse<TFinancialAnalytics>;
