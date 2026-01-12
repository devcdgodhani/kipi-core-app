import type { IUser } from './user';

export const WALLET_TRANSACTION_TYPE = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
  REVERSAL: 'REVERSAL',
  EXPIRY: 'EXPIRY',
  ADJUSTMENT: 'ADJUSTMENT'
} as const;

export type WALLET_TRANSACTION_TYPE = typeof WALLET_TRANSACTION_TYPE[keyof typeof WALLET_TRANSACTION_TYPE];

export const WALLET_TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REVERSED: 'REVERSED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED'
} as const;

export type WALLET_TRANSACTION_STATUS = typeof WALLET_TRANSACTION_STATUS[keyof typeof WALLET_TRANSACTION_STATUS];

export interface IWalletTransactionAttributes {
  _id: string;
  walletId: string;
  userId: string;
  transactionType: WALLET_TRANSACTION_TYPE;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: WALLET_TRANSACTION_STATUS;
  createdAt: string;
  expiryDate?: string;
  user?: IUser;
}
