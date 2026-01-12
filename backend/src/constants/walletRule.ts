export enum WALLET_RULE_TYPE {
  ORDER_CASHBACK = 'ORDER_CASHBACK',
  SIGNUP_BONUS = 'SIGNUP_BONUS',
  REFERRAL_BONUS = 'REFERRAL_BONUS'
}

export enum WALLET_RULE_VALUE_TYPE {
  PERCENTAGE = 'PERCENTAGE',
  FLAT_AMOUNT = 'FLAT_AMOUNT'
}

export enum WALLET_RULE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SCHEDULED = 'SCHEDULED',
  EXPIRED = 'EXPIRED'
}

export const WALLET_RULE_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Wallet rule retrieved successfully',
  CREATE_SUCCESS: 'Wallet rule created successfully',
  UPDATE_SUCCESS: 'Wallet rule updated successfully',
  DELETE_SUCCESS: 'Wallet rule deleted successfully',
  ACTIVATED: 'Wallet rule activated successfully',
  DEACTIVATED: 'Wallet rule deactivated successfully'
};

export const WALLET_RULE_ERROR_MESSAGES = {
  NOT_FOUND: 'Wallet rule not found',
  INVALID_VALUE: 'Invalid rule value',
  DUPLICATE_RULE: 'Rule already exists for this type',
  CANNOT_DELETE_ACTIVE: 'Cannot delete active rule'
};
