import { WalletTransactionModel } from '../../db/mongodb';
import { IWalletTransactionAttributes, IWalletTransactionDocument } from '../../interfaces/walletTransaction';
import { IWalletTransactionService } from '../contracts/walletTransactionServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { 
  WALLET_TRANSACTION_STATUS, 
  WALLET_SOURCE_TYPE, 
  WALLET_TRANSACTION_TYPE,
  WALLET_CREATED_BY,
  WALLET_TRANSACTION_ERROR_MESSAGES
} from '../../constants/walletTransaction';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class WalletTransactionService
  extends MongooseCommonService<IWalletTransactionAttributes, IWalletTransactionDocument>
  implements IWalletTransactionService
{
  constructor() {
    super(WalletTransactionModel as any);
  }

  /**
   * Get user transactions with pagination
   */
  async getUserTransactions(userId: string, options: any): Promise<any> {
    return this.findAllWithPagination({ userId } as any, options);
  }

  /**
   * Get pending transactions for a user
   */
  async getPendingTransactions(userId: string): Promise<IWalletTransactionAttributes[]> {
    return this.findAll(
      { 
        userId, 
        status: WALLET_TRANSACTION_STATUS.PENDING 
      } as any,
      { sort: { createdAt: -1 } }
    );
  }

  /**
   * Get transactions expiring within specified days
   */
  async getExpiringTransactions(userId: string, days: number = 7): Promise<IWalletTransactionAttributes[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    return this.findAll(
      {
        userId,
        status: WALLET_TRANSACTION_STATUS.CONFIRMED,
        expiryDate: {
          $lte: expiryThreshold,
          $gte: new Date()
        }
      } as any,
      { sort: { expiryDate: 1 } }
    );
  }

  /**
   * Confirm a pending transaction
   */
  async confirmTransaction(transactionId: string): Promise<IWalletTransactionAttributes> {
    const transaction = await this.findById(transactionId);

    if (!transaction) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_TRANSACTION_ERROR_MESSAGES.NOT_FOUND
      );
    }

    if (transaction.status !== WALLET_TRANSACTION_STATUS.PENDING) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_TRANSACTION_ERROR_MESSAGES.ALREADY_CONFIRMED
      );
    }

    const updatedTransaction = await this.findOneAndUpdate(
      { _id: transactionId },
      { status: WALLET_TRANSACTION_STATUS.CONFIRMED }
    );

    return updatedTransaction!;
  }

  /**
   * Reverse a transaction
   */
  async reverseTransaction(transactionId: string, reason: string): Promise<IWalletTransactionAttributes> {
    const transaction = await this.findById(transactionId);

    if (!transaction) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_TRANSACTION_ERROR_MESSAGES.NOT_FOUND
      );
    }

    if (transaction.status === WALLET_TRANSACTION_STATUS.REVERSED) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        WALLET_TRANSACTION_ERROR_MESSAGES.ALREADY_REVERSED
      );
    }

    const updatedTransaction = await this.findOneAndUpdate(
      { _id: transactionId },
      { 
        status: WALLET_TRANSACTION_STATUS.REVERSED,
        metadata: {
          ...(transaction.metadata || {}),
          reversalReason: reason,
          reversedAt: new Date()
        }
      }
    );

    return updatedTransaction!;
  }

  /**
   * Expire a transaction
   */
  async expireTransaction(transactionId: string): Promise<IWalletTransactionAttributes> {
    const transaction = await this.findById(transactionId);

    if (!transaction) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_TRANSACTION_ERROR_MESSAGES.NOT_FOUND
      );
    }

    const updatedTransaction = await this.findOneAndUpdate(
      { _id: transactionId },
      { status: WALLET_TRANSACTION_STATUS.EXPIRED }
    );

    return updatedTransaction!;
  }

  /**
   * Create a wallet transaction (internal use)
   */
  async createTransaction(params: {
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
  }): Promise<IWalletTransactionAttributes> {
    const transaction = await this.create({
      walletId: params.walletId,
      userId: params.userId,
      transactionType: params.transactionType,
      sourceType: params.sourceType,
      sourceReferenceId: params.sourceReferenceId,
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      description: params.description,
      status: WALLET_TRANSACTION_STATUS.PENDING,
      expiryDate: params.expiryDate,
      metadata: params.metadata,
      createdByType: params.createdBy || WALLET_CREATED_BY.SYSTEM,
      adminUserId: params.adminUserId
    } as any);

    return transaction;
  }

  /**
   * Get transactions by source reference
   */
  async getTransactionsBySource(
    sourceReferenceId: string, 
    sourceType: WALLET_SOURCE_TYPE
  ): Promise<IWalletTransactionAttributes[]> {
    return this.findAll(
      { 
        sourceReferenceId, 
        sourceType 
      } as any,
      { sort: { createdAt: -1 } }
    );
  }
}

export const walletTransactionService = new WalletTransactionService();
