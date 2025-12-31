import axiosInstance from './http';
import type { ILot, ILotFilters } from '../types/lot';
import type { IPaginationData } from '../types/user';

export const lotService = {
  getWithPagination: async (filters: ILotFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<ILot>, message: string }>('/lot/getWithPagination', filters);
  },

  getAll: async (filters: ILotFilters) => {
    return axiosInstance.post<any, { data: ILot[], message: string }>('/lot/getAll', filters);
  },


  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: ILot, message: string }>('/lot/getOne', { _id: id });
  },

  create: async (data: Partial<ILot>) => {
    return axiosInstance.post<any, { data: ILot, message: string }>('/lot', data);
  },

  update: async (id: string, data: Partial<ILot>) => {
    return axiosInstance.put<any, { message: string }>(`/lot/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/lot/deleteByFilter', { data: { _id: id } });
  }
};
