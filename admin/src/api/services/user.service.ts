import { apiCall } from '../middleware/apiCall';
import type { 
  IApiResponse, 
  IPaginationApiResponse, 
  IUser,
  USER_STATUS
} from '../../types';

export const userService = {
  getOne: async (params: { _id?: string; email?: string }): Promise<IApiResponse<IUser>> => {
    const response = await apiCall.get<IApiResponse<IUser>>('/admin/user/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any): Promise<IApiResponse<IUser[]>> => {
    const response = await apiCall.get<IApiResponse<IUser[]>>('/admin/user/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params: { page: number; limit: number; search?: string }): Promise<IPaginationApiResponse<IUser>> => {
    const response = await apiCall.get<IPaginationApiResponse<IUser>>('/admin/user/getWithPagination', { params });
    return response.data;
  },

  create: async (data: any): Promise<IApiResponse<IUser>> => {
    const response = await apiCall.post<IApiResponse<IUser>>('/admin/user', data);
    return response.data;
  },

  bulkCreate: async (data: any[]): Promise<IApiResponse<IUser[]>> => {
    const response = await apiCall.post<IApiResponse<IUser[]>>('/admin/user/bulkCreate', data);
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IUser>> => {
    const response = await apiCall.put<IApiResponse<IUser>>('/admin/user/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }): Promise<IApiResponse<IUser[]>> => {
    const response = await apiCall.put<IApiResponse<IUser[]>>('/admin/user/updateManyByFilter', data);
    return response.data;
  },

  bulkUpdateStatus: async (data: { status: USER_STATUS }): Promise<IApiResponse> => {
    const response = await apiCall.put<IApiResponse>('/admin/user/bulkUpdate', data);
    return response.data;
  },

  deleteByFilter: async (filter: object): Promise<IApiResponse> => {
    const response = await apiCall.delete<IApiResponse>('/admin/user/deleteByFilter', { data: filter });
    return response.data;
  }
};
