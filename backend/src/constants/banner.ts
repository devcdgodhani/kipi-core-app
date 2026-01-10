export enum BANNER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SCHEDULED = 'SCHEDULED',
}

export enum BANNER_LINK_TYPE {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  EXTERNAL = 'EXTERNAL',
  NONE = 'NONE',
}

export enum BANNER_TARGET_AUDIENCE {
  ALL = 'ALL',
  NEW = 'NEW',
  RETURNING = 'RETURNING',
}

export const BANNER_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Banner retrieved successfully',
  CREATE_SUCCESS: 'Banner created successfully',
  UPDATE_SUCCESS: 'Banner updated successfully',
  DELETE_SUCCESS: 'Banner deleted successfully',
};

export const BANNER_ERROR_MESSAGES = {
  NOT_FOUND: 'Banner not found',
  ALREADY_EXISTS: 'Banner already exists',
  INVALID_DATE_RANGE: 'Invalid date range',
};
