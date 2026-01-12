export enum WALLET_TRANSACTION_TYPE {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  REVERSAL = 'REVERSAL',
  EXPIRY = 'EXPIRY',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum WALLET_SOURCE_TYPE {
  ORDER_CASHBACK = 'ORDER_CASHBACK',
  APP_SHARE = 'APP_SHARE',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  REFUND = 'REFUND',
  EXPIRY = 'EXPIRY',
  ORDER_PAYMENT = 'ORDER_PAYMENT',
  MANUAL_CREDIT = 'MANUAL_CREDIT',
  MANUAL_DEBIT = 'MANUAL_DEBIT',
  SIGNUP_BONUS = 'SIGNUP_BONUS',
  REFERRAL_BONUS = 'REFERRAL_BONUS'
}

export enum WALLET_TRANSACTION_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REVERSED = 'REVERSED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

export enum WALLET_CREATED_BY {
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export const WALLET_TRANSACTION_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Transaction retrieved successfully',
  CREATE_SUCCESS: 'Transaction created successfully',
  UPDATE_SUCCESS: 'Transaction updated successfully',
  DELETE_SUCCESS: 'Transaction deleted successfully',
  CONFIRMED: 'Transaction confirmed successfully',
  REVERSED: 'Transaction reversed successfully',
  EXPIRED: 'Transaction expired successfully'
};

export const WALLET_TRANSACTION_ERROR_MESSAGES = {
  NOT_FOUND: 'Transaction not found',
  INVALID_STATUS: 'Invalid transaction status',
  ALREADY_CONFIRMED: 'Transaction already confirmed',
  ALREADY_REVERSED: 'Transaction already reversed',
  CANNOT_REVERSE: 'Cannot reverse this transaction'
};
