import axiosInstance from './http';
import { type IUser, type IUserFilters, type IPaginationData } from '../types/user';

export const userService = {
  getWithPagination: async (filters: IUserFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<IUser>, message: string }>('/user/getWithPagination', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: IUser, message: string }>('/user/getOne', { _id: id });
  },

  create: async (userData: Partial<IUser>) => {
    return axiosInstance.post<any, { data: IUser, message: string }>('/user', userData);
  },

  update: async (id: string, userData: Partial<IUser>) => {
    return axiosInstance.put<any, { message: string }>(`/user/${id}`, userData);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/user/deleteByFilter', { data: { _id: id } });
  }
};
