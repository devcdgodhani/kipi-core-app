import { apiCall } from '../middleware/apiCall';
import type { 
  IApiResponse, 
  IAttribute, 
  TAttributeListRes
} from '../../types';

export const attributeService = {
  getOne: async (params: any): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.get<IApiResponse<IAttribute>>('/admin/attributes/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any): Promise<IApiResponse<IAttribute[]>> => {
    const response = await apiCall.get<IApiResponse<IAttribute[]>>('/admin/attributes/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any): Promise<TAttributeListRes> => {
    const response = await apiCall.get<TAttributeListRes>('/admin/attributes/getWithPagination', { params });
    return response.data;
  },

  create: async (data: Partial<IAttribute>): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.post<IApiResponse<IAttribute>>('/admin/attributes', data);
    return response.data;
  },

  bulkCreate: async (data: Partial<IAttribute>[]): Promise<IApiResponse<IAttribute[]>> => {
    const response = await apiCall.post<IApiResponse<IAttribute[]>>('/admin/attributes/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<IAttribute>): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.put<IApiResponse<IAttribute>>('/admin/attributes/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateById: async (id: string, data: Partial<IAttribute>): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.put<IApiResponse<IAttribute>>('/admin/attributes/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.put<IApiResponse<IAttribute>>('/admin/attributes/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IAttribute[]>> => {
    const response = await apiCall.put<IApiResponse<IAttribute[]>>('/admin/attributes/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/attributes/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteById: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/attributes/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteByFilter: async (filter: object): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/attributes/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string): Promise<IApiResponse<IAttribute>> => {
    const response = await apiCall.get<IApiResponse<IAttribute>>('/admin/attributes/getOne', { params: { _id: id } });
    return response.data;
  },

  getAllNoPagination: async (): Promise<IApiResponse<IAttribute[]>> => {
      const response = await apiCall.get<IApiResponse<IAttribute[]>>('/admin/attributes/getAll');
      return response.data;
  },
};
