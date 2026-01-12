import { IWalletTransactionAttributes, IWalletTransactionDocument } from '../../interfaces/walletTransaction';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { WALLET_TRANSACTION_STATUS, WALLET_SOURCE_TYPE, WALLET_TRANSACTION_TYPE } from '../../constants/walletTransaction';

export interface IWalletTransactionService extends IMongooseCommonService<IWalletTransactionAttributes, IWalletTransactionDocument> {
  /**
   * Get user transactions with pagination
   */
  getUserTransactions(userId: string, options: any): Promise<any>;

  /**
   * Get pending transactions for a user
   */
  getPendingTransactions(userId: string): Promise<IWalletTransactionAttributes[]>;

  /**
   * Get transactions expiring within specified days
   */
  getExpiringTransactions(userId: string, days: number): Promise<IWalletTransactionAttributes[]>;

  /**
   * Confirm a pending transaction
   */
  confirmTransaction(transactionId: string): Promise<IWalletTransactionAttributes>;

  /**
   * Reverse a transaction
   */
  reverseTransaction(transactionId: string, reason: string): Promise<IWalletTransactionAttributes>;

  /**
   * Expire a transaction
   */
  expireTransaction(transactionId: string): Promise<IWalletTransactionAttributes>;

  /**
   * Create a wallet transaction (internal use)
   */
  createTransaction(params: {
    walletId: string;
    userId: string;
    transactionType: WALLET_TRANSACTION_TYPE;
    sourceType: WALLET_SOURCE_TYPE;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    sourceReferenceId?: string;
    expiryDate?: Date;
    metadata?: any;
    createdBy?: string;
    adminUserId?: string;
  }): Promise<IWalletTransactionAttributes>;

  /**
   * Get transactions by source reference
   */
  getTransactionsBySource(sourceReferenceId: string, sourceType: WALLET_SOURCE_TYPE): Promise<IWalletTransactionAttributes[]>;
}
