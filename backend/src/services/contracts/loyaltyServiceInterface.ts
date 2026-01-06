import { ILoyaltyTransactionAttributes, ILoyaltyTransactionDocument } from '../../interfaces/loyalty';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { LOYALTY_TRANSACTION_TYPE } from '../../constants/loyalty';

export interface ILoyaltyService extends IMongooseCommonService<ILoyaltyTransactionAttributes, ILoyaltyTransactionDocument> {
  updateBalance(userId: string, points: number, type: LOYALTY_TRANSACTION_TYPE, message: string, orderId?: string): Promise<ILoyaltyTransactionAttributes>;
  calculateEarnedPoints(totalAmount: number): number;
  getUserLedger(userId: string, options?: any): Promise<any>;
}
