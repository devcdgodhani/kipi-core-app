export enum FINANCIAL_RECORD_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export enum TRANSACTION_TYPE {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum INCOME_SUBTYPE {
  ORDER = 'ORDER',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER'
}

export enum EXPENSE_SUBTYPE {
  LOT_AMOUNT = 'LOT_AMOUNT',
  RETURN = 'RETURN',
  REWARD = 'REWARD',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER'
}

export enum ECOMMERCE_PLATFORM {
  AMAZON = 'AMAZON',
  FLIPKART = 'FLIPKART',
  MEESHO = 'MEESHO',
  AJIO = 'AJIO',
  MYNTRA = 'MYNTRA',
  SNAPDEAL = 'SNAPDEAL',
  OTHER = 'OTHER'
}

export const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'IndusInd Bank',
  'IDFC First Bank',
  'Yes Bank',
  'Federal Bank',
  'IDBI Bank',
  'Central Bank of India',
  'Indian Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'Punjab & Sind Bank',
  'Indian Overseas Bank',
  'Karur Vysya Bank',
  'Jammu & Kashmir Bank',
  'South Indian Bank',
  'City Union Bank',
  'RBL Bank',
  'Bandhan Bank',
  'AU Small Finance Bank',
  'Equitas Small Finance Bank',
  'Ujjivan Small Finance Bank'
];

export const FINANCIAL_RECORD_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Financial record retrieved successfully',
  CREATE_SUCCESS: 'Financial record created successfully',
  UPDATE_SUCCESS: 'Financial record updated successfully',
  DELETE_SUCCESS: 'Financial record deleted successfully',
  ANALYTICS_SUCCESS: 'Analytics retrieved successfully'
};

export const FINANCIAL_RECORD_ERROR_MESSAGES = {
  NOT_FOUND: 'Financial record not found',
  INVALID_DATE_RANGE: 'Invalid date range',
  INVALID_AMOUNT: 'Invalid amount',
  INVALID_TYPE: 'Invalid transaction type',
  INVALID_SUBTYPE: 'Invalid transaction subtype',
  CREATE_FAILED: 'Failed to create financial record',
  UPDATE_FAILED: 'Failed to update financial record',
  DELETE_FAILED: 'Failed to delete financial record'
};
