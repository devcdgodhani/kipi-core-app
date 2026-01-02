export enum COUPON_TYPE {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum COUPON_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export const COUPON_SUCCESS_MESSAGES = {
  CREATE_SUCCESS: 'Coupon created successfully',
  UPDATE_SUCCESS: 'Coupon updated successfully',
  DELETE_SUCCESS: 'Coupon deleted successfully',
  GET_SUCCESS: 'Coupon fetched successfully',
  APPLY_SUCCESS: 'Coupon applied successfully',
};

export const COUPON_ERROR_MESSAGES = {
  NOT_FOUND: 'Coupon not found',
  INVALID: 'Invalid coupon code',
  EXPIRED: 'Coupon has expired',
  USAGE_LIMIT_REACHED: 'Coupon usage limit reached',
  MIN_ORDER_NOT_MET: 'Minimum order amount not met',
  ALREADY_EXISTS: 'Coupon code already exists',
};
