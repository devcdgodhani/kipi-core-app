import axiosInstance from './http';
import type { IFinancialRecordAttributes, IFinancialRecordFilters, IFinancialAnalytics, IFinancialRecordCreateReq, IFinancialRecordUpdateReq } from '../types/financialRecord.types';
import type { IPaginationData } from '../types/user';

export const financialRecordService = {
  getWithPagination: async (filters: IFinancialRecordFilters) => {
    return axiosInstance.post<any, { data: IPaginationData<IFinancialRecordAttributes>, message: string }>('/financial-record/getWithPagination', filters);
  },

  getAll: async (filters: IFinancialRecordFilters) => {
    return axiosInstance.post<any, { data: IFinancialRecordAttributes[], message: string }>('/financial-record/getAll', filters);
  },

  getOne: async (id: string) => {
    return axiosInstance.post<any, { data: IFinancialRecordAttributes, message: string }>('/financial-record/getOne', { _id: id });
  },

  create: async (data: IFinancialRecordCreateReq) => {
    return axiosInstance.post<any, { data: IFinancialRecordAttributes, message: string }>('/financial-record', data);
  },

  update: async (id: string, data: IFinancialRecordUpdateReq) => {
    return axiosInstance.put<any, { message: string }>(`/financial-record/${id}`, data);
  },

  delete: async (id: string) => {
    return axiosInstance.delete<any, { message: string }>('/financial-record/deleteByFilter', { data: { _id: id } });
  },

  getAnalytics: async (startDate?: Date, endDate?: Date) => {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    return axiosInstance.get<any, { data: IFinancialAnalytics, message: string }>('/financial-record/analytics', { params });
  },

  getReports: async (type: string, startDate?: Date, endDate?: Date) => {
    const params: any = { type };
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    return axiosInstance.get<any, { data: any, message: string }>('/financial-record/reports', { params });
  }
};

