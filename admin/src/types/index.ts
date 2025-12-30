/**
 * REPLICATED FROM BACKEND CONSTANTS
 * Using objects and union types for better compatibility
 */
export const USER_TYPE = {
  MASTER_ADMIN: 'MASTER_ADMIN',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
} as const;
export type USER_TYPE = typeof USER_TYPE[keyof typeof USER_TYPE];

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
  DO_NOT_TELL: 'DO_NOT_TELL',
  NONE: 'NONE',
} as const;
export type GENDER = typeof GENDER[keyof typeof GENDER];

export const SIGN_UP_TYPE = {
  APP: 'APP',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
  META: 'META',
} as const;
export type SIGN_UP_TYPE = typeof SIGN_UP_TYPE[keyof typeof SIGN_UP_TYPE];

export const OTP_TYPE = {
  EMAIL: 'EMAIL',
  MOBILE: 'MOBILE',
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  FORGET_PASSWORD: 'FORGET_PASSWORD',
} as const;
export type OTP_TYPE = typeof OTP_TYPE[keyof typeof OTP_TYPE];

export const TOKEN_TYPE = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  OTP_TOKEN: 'OTP_TOKEN',
  FORGET_PASSWORD_TOKEN: 'FORGET_PASSWORD_TOKEN',
} as const;
export type TOKEN_TYPE = typeof TOKEN_TYPE[keyof typeof TOKEN_TYPE];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type USER_STATUS = typeof USER_STATUS[keyof typeof USER_STATUS];

/**
 * SHARED INTERFACES
 */
export interface IApiResponse<T = undefined> {
  code: string;
  status: number;
  message: string;
  data: T;
  error?: string | any[] | object;
}

export interface IPaginationData<T> {
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  currentPage: number;
  recordList: T[];
}

export interface IPaginationApiResponse<T> extends IApiResponse<IPaginationData<T>> {}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobile: string;
  type: USER_TYPE;
  status: USER_STATUS;
  gender: GENDER;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  countryCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthToken {
  type: TOKEN_TYPE;
  token: string;
  userId?: string;
  expiredAt?: number;
}

export type TLoginRes = IApiResponse<IUser & { tokens: IAuthToken[] }>;
export type TRegisterRes = IApiResponse<{ tokens: IAuthToken[] }>;
export type TVerifyOtpRes = IApiResponse<{ tokens: IAuthToken[]; user?: IUser }>;
export type TRefreshTokensRes = IApiResponse<{ tokens: IAuthToken[] }>;

/**
 * PRODUCT SYSTEM CONSTANTS
 */
export const ATTRIBUTE_TYPE = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  MULTISELECT: 'MULTISELECT',
} as const;
export type ATTRIBUTE_TYPE = typeof ATTRIBUTE_TYPE[keyof typeof ATTRIBUTE_TYPE];

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type PRODUCT_STATUS = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

/**
 * PRODUCT SYSTEM INTERFACES
 */
export interface IAttribute {
  _id: string;
  name: string;
  code: string;
  type: ATTRIBUTE_TYPE;
  options?: string[];
  isRequired: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  attributes?: string[] | IAttribute[]; // IDs or Populated
  description?: string;
  image?: string;
  isActive: boolean;
  children?: ICategory[]; // For tree structure
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductAttributeValue {
  attributeId: string | IAttribute;
  value: string;
  attributeName?: string; // Optional helper
}

export interface ISku {
  _id: string;
  product: string | IProduct;
  sku: string;
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  stock: number;
  attributes: IProductAttributeValue[];
  images: string[];
  lotId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string | ICategory;
  brand?: string;
  mrp?: number;
  sellingPrice?: number;
  costPrice?: number;
  status: PRODUCT_STATUS;
  specifications?: Record<string, any>;
  sourceType: 'SELF_MANUFACTURE' | 'SUPPLIER';
  supplier?: string | IUser; // Deprecated
  supplierId?: string;
  hasLotTracking: boolean;
  images?: string[];
  skus?: ISku[]; // Virtual
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API RESPONSE TYPES
 */
export type TCategoryTreeRes = IApiResponse<ICategory[]>;
export type TAttributeListRes = IPaginationApiResponse<IAttribute>;
export type TProductListRes = IPaginationApiResponse<IProduct>;
export type TProductDetailRes = IApiResponse<IProduct>;
