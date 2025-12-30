import { apiCall } from '../middleware/apiCall';
import type { 
  IApiResponse, 
  IProduct, 
  TProductListRes,
  TProductDetailRes
} from '../../types';

export const productService = {
  getOne: async (params: any): Promise<TProductDetailRes> => {
    const response = await apiCall.get<TProductDetailRes>('/admin/products/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any): Promise<IApiResponse<IProduct[]>> => {
    const response = await apiCall.get<IApiResponse<IProduct[]>>('/admin/products/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any): Promise<TProductListRes> => {
    const response = await apiCall.get<TProductListRes>('/admin/products/getWithPagination', { params });
    return response.data;
  },

  getById: async (id: string): Promise<TProductDetailRes> => {
    const response = await apiCall.get<TProductDetailRes>('/admin/products/getOne', { params: { _id: id } });
    return response.data;
  },

  create: async (data: Partial<IProduct> & { variants?: any[] }): Promise<TProductDetailRes> => {
    const response = await apiCall.post<TProductDetailRes>('/admin/products', data);
    return response.data;
  },

  bulkCreate: async (data: any[]): Promise<IApiResponse<IProduct[]>> => {
    const response = await apiCall.post<IApiResponse<IProduct[]>>('/admin/products/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<IProduct> & { variants?: any[] }): Promise<TProductDetailRes> => {
    const response = await apiCall.put<TProductDetailRes>(`/admin/products/${id}`, data);
    return response.data;
  },

  updateById: async (id: string, data: Partial<IProduct> & { variants?: any[] }): Promise<TProductDetailRes> => {
    const response = await apiCall.put<TProductDetailRes>(`/admin/products/${id}`, data);
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IProduct>> => {
    const response = await apiCall.put<IApiResponse<IProduct>>('/admin/products/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IProduct[]>> => {
    const response = await apiCall.put<IApiResponse<IProduct[]>>('/admin/products/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/products/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteById: async (id: string): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/products/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteByFilter: async (filter: object): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/products/deleteByFilter', { data: filter });
    return response.data;
  },
};
