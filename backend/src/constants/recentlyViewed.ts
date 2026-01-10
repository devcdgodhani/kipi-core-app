export enum RECENTLY_VIEWED_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const RECENTLY_VIEWED_SUCCESS_MESSAGES = {
  TRACK_SUCCESS: 'Product view tracked successfully',
  GET_SUCCESS: 'Recently viewed products retrieved successfully',
};

export const RECENTLY_VIEWED_ERROR_MESSAGES = {
  NOT_FOUND: 'No recently viewed products found',
};

export const RECENTLY_VIEWED_LIMITS = {
  MAX_VIEWS_PER_USER: 50,
  DEFAULT_LIMIT: 10,
  TTL_DAYS: 30,
};
