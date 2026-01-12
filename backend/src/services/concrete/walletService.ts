import { WalletModel } from '../../db/mongodb/models/walletModel';
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
   * This method should be called by WalletTransactionService or for manual credits
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

    // Record transaction
    const { walletTransactionService } = await import('./walletTransactionService');
    const { WALLET_TRANSACTION_TYPE, WALLET_SOURCE_TYPE, WALLET_TRANSACTION_STATUS, WALLET_CREATED_BY } = await import('../../constants/walletTransaction');
    
    await walletTransactionService.create({
      walletId: (wallet as any)._id,
      userId,
      transactionType: WALLET_TRANSACTION_TYPE.CREDIT,
      sourceType: WALLET_SOURCE_TYPE.MANUAL_CREDIT,
      amount,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance + amount,
      description: metadata.description || 'Manual credit by admin',
      status: WALLET_TRANSACTION_STATUS.CONFIRMED,
      metadata: { ...metadata, processedAt: new Date() },
      createdByType: WALLET_CREATED_BY.ADMIN,
      adminUserId: metadata.adminUserId
    } as any);

    return updatedWallet!;
  }

  /**
   * Debit wallet (deduct money)
   * This method should be called by WalletTransactionService or for manual debits
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

    // Record transaction
    const { walletTransactionService } = await import('./walletTransactionService');
    const { WALLET_TRANSACTION_TYPE, WALLET_SOURCE_TYPE, WALLET_TRANSACTION_STATUS, WALLET_CREATED_BY } = await import('../../constants/walletTransaction');
    
    await walletTransactionService.create({
      walletId: (wallet as any)._id,
      userId,
      transactionType: WALLET_TRANSACTION_TYPE.DEBIT,
      sourceType: WALLET_SOURCE_TYPE.ADMIN_ADJUSTMENT,
      amount,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance - amount,
      description: metadata.description || 'Manual debit by admin',
      status: WALLET_TRANSACTION_STATUS.CONFIRMED,
      metadata: { ...metadata, processedAt: new Date() },
      createdByType: WALLET_CREATED_BY.ADMIN,
      adminUserId: metadata.adminUserId
    } as any);

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

  /**
   * Revoke previously awarded cashback
   * Returns shortfall if available balance is less than revocation amount
   */
  async revokeCashback(userId: string, amount: number, metadata: any): Promise<number> {
    const wallet = await this.getOrCreateWallet(userId);
    let shortfall = 0;
    let actualDeduction = amount;

    if (wallet.availableBalance < amount) {
      shortfall = amount - wallet.availableBalance;
      actualDeduction = wallet.availableBalance;
    }

    if (actualDeduction > 0) {
      await this.findOneAndUpdate(
        { _id: (wallet as any)._id },
        {
          $inc: { 
            availableBalance: -actualDeduction,
            totalSpent: actualDeduction 
          },
          lastCalculatedAt: new Date()
        }
      );
    }

    // Record transaction
    const { walletTransactionService } = await import('./walletTransactionService');
    const { WALLET_TRANSACTION_TYPE, WALLET_SOURCE_TYPE, WALLET_TRANSACTION_STATUS, WALLET_CREATED_BY } = await import('../../constants/walletTransaction');
    
    // We use direct create to set status to CONFIRMED immediately
    await walletTransactionService.create({
      walletId: (wallet as any)._id,
      userId,
      transactionType: WALLET_TRANSACTION_TYPE.REVERSAL,
      sourceType: WALLET_SOURCE_TYPE.ORDER_CASHBACK,
      sourceReferenceId: metadata.orderId,
      amount,
      balanceBefore: wallet.availableBalance,
      balanceAfter: Math.max(0, wallet.availableBalance - amount),
      description: metadata.description || `Cashback revocation for Order #${metadata.orderNumber || 'Unknown'}`,
      status: WALLET_TRANSACTION_STATUS.CONFIRMED,
      metadata: { ...metadata, shortfall, revokedAmount: amount, processedAt: new Date() },
      createdByType: WALLET_CREATED_BY.SYSTEM
    } as any);

    return shortfall;
  }
}

export const walletService = new WalletService();
