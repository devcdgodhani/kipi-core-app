export enum WALLET_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export const WALLET_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Wallet retrieved successfully',
  CREATE_SUCCESS: 'Wallet created successfully',
  UPDATE_SUCCESS: 'Wallet updated successfully',
  DELETE_SUCCESS: 'Wallet deleted successfully',
  BALANCE_UPDATED: 'Wallet balance updated successfully',
  CREDIT_SUCCESS: 'Wallet credited successfully',
  DEBIT_SUCCESS: 'Wallet debited successfully',
  RECALCULATED: 'Wallet balance recalculated successfully'
};

export const WALLET_ERROR_MESSAGES = {
  NOT_FOUND: 'Wallet not found',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
  INVALID_AMOUNT: 'Invalid amount specified',
  WALLET_BLOCKED: 'Wallet is blocked',
  ALREADY_EXISTS: 'Wallet already exists for this user'
};
