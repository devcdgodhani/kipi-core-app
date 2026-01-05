import http from './http';
import type { Coupon, CouponFilters } from '../types/coupon.types';

const COUPON_BASE_URL = '/coupon';

export const couponService = {
  getAll: async (params?: CouponFilters) => {
    const response: any = await http.post(`${COUPON_BASE_URL}/getAll`, params);
    return response;
  },

  getWithPagination: async (params?: any) => {
    const response: any = await http.post(`${COUPON_BASE_URL}/getWithPagination`, params);
    return response;
  },

  getById: async (id: string) => {
    const response: any = await http.post(`${COUPON_BASE_URL}/getOne`, { _id: id });
    return response;
  },

  create: async (data: Partial<Coupon>) => {
    const response: any = await http.post(`${COUPON_BASE_URL}`, data);
    return response;
  },

  update: async (id: string, data: Partial<Coupon>) => {
    const response: any = await http.put(`${COUPON_BASE_URL}/${id}`, data);
    return response;
  },

  deleteById: async (id: string) => {
    const response: any = await http.delete(`${COUPON_BASE_URL}/${id}`);
    return response;
  },
};
