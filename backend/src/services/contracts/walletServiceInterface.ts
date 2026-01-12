import { IWalletAttributes, IWalletDocument } from '../../interfaces/wallet';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IWalletService extends IMongooseCommonService<IWalletAttributes, IWalletDocument> {
  /**
   * Get or create wallet for a user
   */
  getOrCreateWallet(userId: string): Promise<IWalletAttributes>;

  /**
   * Get wallet balance for a user
   */
  getWalletBalance(userId: string): Promise<number>;

  /**
   * Get wallet by user ID
   */
  getWalletByUserId(userId: string): Promise<IWalletAttributes | null>;

  /**
   * Credit wallet (add money)
   */
  creditWallet(userId: string, amount: number, metadata: any): Promise<IWalletAttributes>;

  /**
   * Debit wallet (deduct money)
   */
  debitWallet(userId: string, amount: number, metadata: any): Promise<IWalletAttributes>;

  /**
   * Block balance (for pending cashback)
   */
  blockBalance(userId: string, amount: number): Promise<IWalletAttributes>;

  /**
   * Release blocked balance
   */
  releaseBlockedBalance(userId: string, amount: number): Promise<IWalletAttributes>;

  /**
   * Recalculate wallet balance from transactions
   */
  recalculateBalance(walletId: string): Promise<IWalletAttributes>;

  /**
   * Block wallet (admin action)
   */
  blockWallet(walletId: string): Promise<IWalletAttributes>;

  /**
   * Unblock wallet (admin action)
   */
  unblockWallet(walletId: string): Promise<IWalletAttributes>;
}
