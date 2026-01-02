export const COUPON_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FLAT: 'FLAT',
} as const;

export type COUPON_TYPE = (typeof COUPON_TYPE)[keyof typeof COUPON_TYPE];

export const COUPON_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type COUPON_STATUS = (typeof COUPON_STATUS)[keyof typeof COUPON_STATUS];

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: COUPON_TYPE;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  userIds?: string[];
  status: COUPON_STATUS;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFilters {
  code?: string;
  status?: COUPON_STATUS;
  search?: string;
}
