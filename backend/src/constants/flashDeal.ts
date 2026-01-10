export enum FLASH_DEAL_STATUS {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export enum FLASH_DEAL_DISCOUNT_TYPE {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export const FLASH_DEAL_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Flash deal retrieved successfully',
  CREATE_SUCCESS: 'Flash deal created successfully',
  UPDATE_SUCCESS: 'Flash deal updated successfully',
  DELETE_SUCCESS: 'Flash deal deleted successfully',
};

export const FLASH_DEAL_ERROR_MESSAGES = {
  NOT_FOUND: 'Flash deal not found',
  EXPIRED: 'Flash deal has expired',
  SOLD_OUT: 'Flash deal sold out',
  LIMIT_EXCEEDED: 'User purchase limit exceeded',
};
