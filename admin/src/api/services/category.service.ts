import { apiCall } from '../middleware/apiCall';
import type { 
  IApiResponse, 
  ICategory, 
  TCategoryTreeRes 
} from '../../types';

export const categoryService = {
  getOne: async (params: any): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.get<IApiResponse<ICategory>>('/admin/categories/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any): Promise<IApiResponse<ICategory[]>> => {
    const response = await apiCall.get<IApiResponse<ICategory[]>>('/admin/categories/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any): Promise<IApiResponse<any>> => {
    const response = await apiCall.get<IApiResponse<any>>('/admin/categories/getWithPagination', { params });
    return response.data;
  },

  getTree: async (): Promise<TCategoryTreeRes> => {
    const response = await apiCall.get<TCategoryTreeRes>('/admin/categories/tree');
    return response.data;
  },

  getById: async (id: string): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.get<IApiResponse<ICategory>>('/admin/categories/getOne', { params: { _id: id } });
    return response.data;
  },

  create: async (data: Partial<ICategory>): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.post<IApiResponse<ICategory>>('/admin/categories', data);
    return response.data;
  },

  bulkCreate: async (data: Partial<ICategory>[]): Promise<IApiResponse<ICategory[]>> => {
    const response = await apiCall.post<IApiResponse<ICategory[]>>('/admin/categories/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ICategory>): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.put<IApiResponse<ICategory>>('/admin/categories/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateById: async (id: string, data: Partial<ICategory>): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.put<IApiResponse<ICategory>>('/admin/categories/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<ICategory>> => {
    const response = await apiCall.put<IApiResponse<ICategory>>('/admin/categories/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<ICategory[]>> => {
    const response = await apiCall.put<IApiResponse<ICategory[]>>('/admin/categories/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/categories/deleteByFilter', {
      data: { _id: id }
    });
    return response.data;
  },

  deleteById: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/categories/deleteByFilter', {
      data: { _id: id }
    });
    return response.data;
  },

  deleteByFilter: async (filter: object): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/categories/deleteByFilter', { data: filter });
    return response.data;
  },

  updateAttributes: async (id: string, attributeIds: string[]): Promise<IApiResponse<ICategory>> => {
      const response = await apiCall.put<IApiResponse<ICategory>>(`/admin/categories/${id}/attributes`, { attributeIds });
      return response.data;
  }
};
