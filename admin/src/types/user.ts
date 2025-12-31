export const USER_TYPE = {
  MASTER_ADMIN: 'MASTER_ADMIN',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
} as const;
export type USER_TYPE = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type USER_STATUS = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  DO_NOT_TELL: 'DO_NOT_TELL',
  NONE: 'NONE',
} as const;
export type GENDER = (typeof GENDER)[keyof typeof GENDER];

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  countryCode?: string;
  type: USER_TYPE;
  status: USER_STATUS;
  gender: GENDER;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserFilters {
  search?: string;
  type?: USER_TYPE | USER_TYPE[];
  status?: USER_STATUS | USER_STATUS[];
  isVerified?: boolean;
  isMobileVerified?: boolean;
  isEmailVerified?: boolean;
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}

export interface IPaginationData<T> {
  recordList: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}
