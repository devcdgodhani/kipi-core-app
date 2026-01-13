import { IFinancialRecordAttributes, IFinancialRecordDocument } from '../../interfaces/financialRecord';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { TFinancialAnalytics } from '../../types/financialRecord';

export interface IFinancialRecordService extends IMongooseCommonService<IFinancialRecordAttributes, IFinancialRecordDocument> {
  createAutomaticIncomeRecord(
    orderId: string,
    amount: number,
    date: Date
  ): Promise<IFinancialRecordAttributes>;

  createAutomaticExpenseRecord(
    type: string,
    referenceId: string,
    amount: number,
    date: Date,
    referenceType: 'lot' | 'return' | 'wallet'
  ): Promise<IFinancialRecordAttributes>;

    getAnalytics(startDate?: Date, endDate?: Date): Promise<any>;
    getDailyTrends(startDate: Date, endDate: Date): Promise<any[]>;
    getTypeBreakdown(startDate: Date, endDate: Date): Promise<any>;
    getLotProfitability(startDate?: Date, endDate?: Date): Promise<any[]>;
    getBankReports(startDate: Date, endDate: Date): Promise<any>;
    getByDateRange(startDate: Date, endDate: Date): Promise<IFinancialRecordDocument[]>;
}
