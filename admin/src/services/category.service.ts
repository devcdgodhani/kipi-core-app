import axiosInstance from './http';
import type { ICategory, ICategoryFilters } from '../types/category';
import type { IPaginationData } from '../types/user';

export const categoryService = {
  getAll: async (filters: ICategoryFilters) => {
    return axiosInstance.post<any, { data: ICategory[], message: string }>('/category/getAll', filters);
  },

  getWithPagination: async (filters: ICategoryFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<ICategory>, message: string }>('/category/getWithPagination', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: ICategory, message: string }>('/category/getOne', { _id: id });
  },

  create: async (data: Partial<ICategory>) => {
    return axiosInstance.post<any, { data: ICategory, message: string }>('/category', data);
  },

  update: async (id: string, data: Partial<ICategory>) => {
    return axiosInstance.put<any, { message: string }>(`/category/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/category/deleteByFilter', { data: { _id: id } });
  }
};
