import axiosInstance from './http';
import { type IAttribute, type IAttributeFilter, type IPaginationData } from '../types/attribute';

export const attributeService = {
  getWithPagination: async (filters: IAttributeFilter) => {
    return axiosInstance.post<any, { data: IPaginationData<IAttribute>, message: string }>('/attribute/getWithPagination', filters);
  },

  getAll: async (filters?: IAttributeFilter) => {
    return axiosInstance.post<any, { data: IAttribute[], message: string }>('/attribute/getAll', filters || {});
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: IAttribute, message: string }>('/attribute/getOne', { _id: id });
  },

  create: async (attributeData: Partial<IAttribute>) => {
    return axiosInstance.post<any, { data: IAttribute, message: string }>('/attribute', attributeData);
  },

  update: async (id: string, attributeData: Partial<IAttribute>) => {
    return axiosInstance.put<any, { message: string }>(`/attribute/${id}`, attributeData);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/attribute/deleteByFilter', { data: { _id: id } });
  }
};
