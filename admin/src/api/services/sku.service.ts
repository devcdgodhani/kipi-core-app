import { apiCall } from '../middleware/apiCall';
import type { 
  IApiResponse, 
  ISku,
  IPaginationApiResponse
} from '../../types';

export const skuService = {
  getOne: async (params: any): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.get<IApiResponse<ISku>>('/admin/skus/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any): Promise<IApiResponse<ISku[]>> => {
    const response = await apiCall.get<IApiResponse<ISku[]>>('/admin/skus/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any): Promise<IPaginationApiResponse<ISku>> => {
    const response = await apiCall.get<IPaginationApiResponse<ISku>>('/admin/skus/getWithPagination', { params });
    return response.data;
  },

  create: async (data: Partial<ISku>): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.post<IApiResponse<ISku>>('/admin/skus', data);
    return response.data;
  },

  bulkCreate: async (data: any[]): Promise<IApiResponse<ISku[]>> => {
    const response = await apiCall.post<IApiResponse<ISku[]>>('/admin/skus/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ISku>): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.put<IApiResponse<ISku>>('/admin/skus/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateById: async (id: string, data: Partial<ISku>): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.put<IApiResponse<ISku>>('/admin/skus/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.put<IApiResponse<ISku>>('/admin/skus/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<ISku[]>> => {
    const response = await apiCall.put<IApiResponse<ISku[]>>('/admin/skus/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/skus/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteById: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/skus/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteByFilter: async (filter: object): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/skus/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string): Promise<IApiResponse<ISku>> => {
    const response = await apiCall.get<IApiResponse<ISku>>('/admin/skus/getOne', { params: { _id: id } });
    return response.data;
  }
};
