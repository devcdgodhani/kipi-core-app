import axiosInstance from './http';
import type { IProduct, IProductFilters } from '../types/product';
import type { IPaginationData } from '../types/user';

export const productService = {
  getAll: async (filters: IProductFilters) => {
    return axiosInstance.post<any, { data: IProduct[], message: string }>('/product/getAll', filters);
  },

  getWithPagination: async (filters: IProductFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<IProduct>, message: string }>('/product/getWithPagination', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: IProduct, message: string }>('/product/getOne', { _id: id });
  },

  create: async (data: Partial<IProduct>) => {
    return axiosInstance.post<any, { data: IProduct, message: string }>('/product', data);
  },

  update: async (id: string, data: Partial<IProduct>) => {
    return axiosInstance.put<any, { message: string }>(`/product/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/product/deleteByFilter', { data: { _id: id } });
  }
};
