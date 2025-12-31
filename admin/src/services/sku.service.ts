import axiosInstance from './http';
import type { ISku, ISkuFilters } from '../types/sku';
import type { IPaginationData } from '../types/user';

export const skuService = {
  getAll: async (filters: ISkuFilters) => {
    return axiosInstance.post<any, { data: ISku[], message: string }>('/sku/getAll', filters);
  },

  getWithPagination: async (filters: ISkuFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<ISku>, message: string }>('/sku/getWithPagination', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: ISku, message: string }>('/sku/getOne', { _id: id });
  },

  create: async (data: Partial<ISku>) => {
    return axiosInstance.post<any, { data: ISku, message: string }>('/sku', data);
  },

  update: async (id: string, data: Partial<ISku>) => {
    return axiosInstance.put<any, { message: string }>(`/sku/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/sku/deleteByFilter', { data: { _id: id } });
  }
};
