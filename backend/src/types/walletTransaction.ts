import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IWalletTransactionAttributes } from '../interfaces/walletTransaction';

export type TWalletTransactionRes = IApiResponse<IWalletTransactionAttributes>;
export type TWalletTransactionListRes = IApiResponse<IWalletTransactionAttributes[]>;
export type TWalletTransactionListPaginationRes = IPaginationApiResponse<IWalletTransactionAttributes>;

export type TCreateTransactionReq = {
  walletId: string;
  userId: string;
  transactionType: string;
  sourceType: string;
  sourceReferenceId?: string;
  amount: number;
  description: string;
  expiryDate?: Date;
  metadata?: any;
  createdBy?: string;
  adminUserId?: string;
};

export type TUpdateTransactionReq = {
  status?: string;
  expiryDate?: Date;
  description?: string;
  metadata?: any;
};
