import { LoyaltyTransactionModel, UserModel } from '../../db/mongodb';
import { ILoyaltyTransactionAttributes, ILoyaltyTransactionDocument } from '../../interfaces/loyalty';
import { MongooseCommonService } from './mongooseCommonService';
import { LOYALTY_TRANSACTION_TYPE, LOYALTY_CONFIG } from '../../constants/loyalty';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { userService } from './userService';

import { ILoyaltyService } from '../contracts/loyaltyServiceInterface';

export class LoyaltyService extends MongooseCommonService<ILoyaltyTransactionAttributes, ILoyaltyTransactionDocument> implements ILoyaltyService {
  private get userService() { return userService; }
  constructor() {
    super(LoyaltyTransactionModel);
  }

  /**
   * Add/Subtract points with ledger entry
   */
  async updateBalance(userId: string, points: number, type: LOYALTY_TRANSACTION_TYPE, message: string, orderId?: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'User not found');
    }
 
    // Update user balance
    const newBalance = (user as any).loyaltyPoints + points;
    if (newBalance < 0) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        'Insufficient loyalty balance'
      );
    }
 
    const updateData: any = { loyaltyPoints: newBalance };
    if (points > 0) {
      updateData.totalEarnedPoints = ((user as any).totalEarnedPoints || 0) + points;
      // Points expire 1 year from now
      updateData.pointsExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    await this.userService.updateOne({ _id: userId } as any, updateData);

    // Create ledger entry
    return this.create({
      userId,
      orderId,
      type,
      points,
      balanceAfter: newBalance,
      message
    } as any);
  }

  /**
   * Calculate points for an order
   */
  calculateEarnedPoints(totalAmount: number): number {
    return Math.floor((totalAmount * LOYALTY_CONFIG.POINTS_EARNED_PERCENT) / 100);
  }

  /**
   * Get user ledger
   */
  async getUserLedger(userId: string, options: any = {}) {
    return this.findAllWithPagination({ userId }, options);
  }
}

export const loyaltyService = new LoyaltyService();
