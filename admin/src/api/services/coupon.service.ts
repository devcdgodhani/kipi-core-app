import { apiCall } from '../middleware/apiCall';

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';
  discountValue: number;
  applicability: 'ALL' | 'CATEGORY' | 'PRODUCT' | 'CART_VALUE' | 'USER_SEGMENT';
  applicableCategories?: string[];
  applicableProducts?: string[];
  minCartValue?: number;
  maxDiscountCap?: number;
  userSegments?: string[];
  startDate?: string;
  endDate?: string;
  festivalEvent?: string;
  dayTimeRestrictions?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  currentUsageCount?: number;
  canStackWithOthers: boolean;
  priority: number;
  isActive: boolean;
  autoApply: boolean;
}

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';
  discountValue: number;
  applicability: 'ALL' | 'CATEGORY' | 'PRODUCT' | 'CART_VALUE' | 'USER_SEGMENT';
  applicableCategories?: string[];
  applicableProducts?: string[];
  minCartValue?: number;
  maxDiscountCap?: number;
  userSegments?: string[];
  startDate?: string;
  endDate?: string;
  festivalEvent?: string;
  dayTimeRestrictions?: {
    days?: string[];
    startTime?: string;
    endTime?: string;
  };
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  canStackWithOthers?: boolean;
  priority?: number;
  isActive?: boolean;
  autoApply?: boolean;
}

export const couponService = {
  // Standardized Methods
  getOne: async (params: any) => {
    const response = await apiCall.get('/admin/coupons/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any) => {
    const response = await apiCall.get('/admin/coupons/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any) => {
    const response = await apiCall.get('/admin/coupons/getWithPagination', { params });
    return response.data;
  },

  create: async (data: CreateCouponData) => {
    const response = await apiCall.post('/admin/coupons', data);
    return response.data;
  },

  bulkCreate: async (data: CreateCouponData[]) => {
    const response = await apiCall.post('/admin/coupons/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCouponData>) => {
    const response = await apiCall.put('/admin/coupons/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateById: async (id: string, data: Partial<CreateCouponData>) => {
    const response = await apiCall.put('/admin/coupons/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/coupons/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/coupons/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall.delete('/admin/coupons/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteById: async (id: string) => {
    const response = await apiCall.delete('/admin/coupons/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteByFilter: async (filter: object) => {
    const response = await apiCall.delete('/admin/coupons/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string) => {
    const response = await apiCall.get('/admin/coupons/getOne', { params: { _id: id } });
    return response.data;
  },

  // Specialized Methods
  validateCoupon: async (code: string, cartData: any) => {
    const response = await apiCall.post('/admin/coupons/validate', { code, cartData });
    return response.data;
  },

  applyCoupon: async (code: string, cartData: any) => {
    const response = await apiCall.post('/admin/coupons/apply', { code, cartData });
    return response.data;
  },

  getApplicableCoupons: async (cartData: any) => {
    const response = await apiCall.post('/admin/coupons/applicable', { cartData });
    return response.data;
  },

  getActiveCoupons: async () => {
    const response = await apiCall.get('/admin/coupons/active');
    return response.data;
  },

  scheduleCoupon: async (id: string, startDate: string, endDate: string) => {
    const response = await apiCall.post(`/admin/coupons/${id}/schedule`, { startDate, endDate });
    return response.data;
  },
};
