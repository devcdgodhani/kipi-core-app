import { WalletModel } from '../../db/mongodb';
import { IWalletAttributes, IWalletDocument } from '../../interfaces/wallet';
import { IWalletService } from '../contracts/walletServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { WALLET_STATUS, WALLET_ERROR_MESSAGES } from '../../constants/wallet';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class WalletService
  extends MongooseCommonService<IWalletAttributes, IWalletDocument>
  implements IWalletService
{
  constructor() {
    super(WalletModel as any);
  }

  /**
   * Get or create wallet for a user
   */
  async getOrCreateWallet(userId: string): Promise<IWalletAttributes> {
    let wallet = await this.findOne({ userId } as any);
    
    if (!wallet) {
      wallet = await this.create({
        userId,
        availableBalance: 0,
        blockedBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        totalExpired: 0,
        lastCalculatedAt: new Date(),
        status: WALLET_STATUS.ACTIVE
      } as any);
    }

    return wallet;
  }

  /**
   * Get wallet balance for a user
   */
  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.availableBalance;
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string): Promise<IWalletAttributes | null> {
    return this.findOne({ userId } as any);
  }

  /**
   * Credit wallet (add money)
   * This method should be called by WalletTransactionService
   */
  async creditWallet(userId: string, amount: number, metadata: any): Promise<IWalletAttributes> {
    if (amount <= 0) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.INVALID_AMOUNT
      );
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status === WALLET_STATUS.BLOCKED) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.WALLET_BLOCKED
      );
    }

    const updatedWallet = await this.findOneAndUpdate(
      { _id: (wallet as any)._id },
      {
        $inc: { 
          availableBalance: amount,
          totalEarned: amount
        },
        lastCalculatedAt: new Date()
      }
    );

    return updatedWallet!;
  }

  /**
   * Debit wallet (deduct money)
   * This method should be called by WalletTransactionService
   */
  async debitWallet(userId: string, amount: number, metadata: any): Promise<IWalletAttributes> {
    if (amount <= 0) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.INVALID_AMOUNT
      );
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.status === WALLET_STATUS.BLOCKED) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.WALLET_BLOCKED
      );
    }

    if (wallet.availableBalance < amount) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.INSUFFICIENT_BALANCE
      );
    }

    const updatedWallet = await this.findOneAndUpdate(
      { _id: (wallet as any)._id },
      {
        $inc: { 
          availableBalance: -amount,
          totalSpent: amount
        },
        lastCalculatedAt: new Date()
      }
    );

    return updatedWallet!;
  }

  /**
   * Block balance (for pending cashback)
   */
  async blockBalance(userId: string, amount: number): Promise<IWalletAttributes> {
    if (amount <= 0) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.INVALID_AMOUNT
      );
    }

    const wallet = await this.getOrCreateWallet(userId);

    const updatedWallet = await this.findOneAndUpdate(
      { _id: (wallet as any)._id },
      {
        $inc: { blockedBalance: amount },
        lastCalculatedAt: new Date()
      }
    );

    return updatedWallet!;
  }

  /**
   * Release blocked balance
   */
  async releaseBlockedBalance(userId: string, amount: number): Promise<IWalletAttributes> {
    if (amount <= 0) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_ERROR_MESSAGES.INVALID_AMOUNT
      );
    }

    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.blockedBalance < amount) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        'Insufficient blocked balance'
      );
    }

    const updatedWallet = await this.findOneAndUpdate(
      { _id: (wallet as any)._id },
      {
        $inc: { 
          blockedBalance: -amount,
          availableBalance: amount
        },
        lastCalculatedAt: new Date()
      }
    );

    return updatedWallet!;
  }

  /**
   * Recalculate wallet balance from transactions
   * This will be implemented after WalletTransaction module is created
   */
  async recalculateBalance(walletId: string): Promise<IWalletAttributes> {
    const wallet = await this.findById(walletId);
    
    if (!wallet) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_ERROR_MESSAGES.NOT_FOUND
      );
    }

    // TODO: Implement recalculation logic after WalletTransaction module is created
    // For now, just update the lastCalculatedAt timestamp
    const updatedWallet = await this.findOneAndUpdate(
      { _id: walletId },
      { lastCalculatedAt: new Date() }
    );

    return updatedWallet!;
  }

  /**
   * Block wallet (admin action)
   */
  async blockWallet(walletId: string): Promise<IWalletAttributes> {
    const updatedWallet = await this.findOneAndUpdate(
      { _id: walletId },
      { status: WALLET_STATUS.BLOCKED }
    );

    if (!updatedWallet) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_ERROR_MESSAGES.NOT_FOUND
      );
    }

    return updatedWallet;
  }

  /**
   * Unblock wallet (admin action)
   */
  async unblockWallet(walletId: string): Promise<IWalletAttributes> {
    const updatedWallet = await this.findOneAndUpdate(
      { _id: walletId },
      { status: WALLET_STATUS.ACTIVE }
    );

    if (!updatedWallet) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_ERROR_MESSAGES.NOT_FOUND
      );
    }

    return updatedWallet;
  }
}

export const walletService = new WalletService();
