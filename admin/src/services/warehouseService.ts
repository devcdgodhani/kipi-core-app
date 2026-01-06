import http from './http';
import type { IApiResponse, IPaginationData } from '../types/common';

export interface IWarehouse {
  _id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark?: string;
  };
  contactPerson: string;
  mobile: string;
  email: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
}

const warehouseService = {
  getWithPagination: async (filters: any = {}, page: number = 1, limit: number = 10): Promise<IApiResponse<IPaginationData<IWarehouse>>> => {
    const response = await http.post<IApiResponse<IPaginationData<IWarehouse>>>('/warehouse/getWithPagination', { 
      page, 
      limit, 
      ...filters 
    });
    return response as any;
  },

  getAll: async (filters: any = {}): Promise<IApiResponse<IWarehouse[]>> => {
    const response = await http.post<IApiResponse<IWarehouse[]>>('/warehouse/getAll', filters);
    return response as any;
  },

  create: async (data: any): Promise<IApiResponse<IWarehouse>> => {
    const response = await http.post<IApiResponse<IWarehouse>>('/warehouse', data);
    return response as any;
  },

  getOne: async (id: string): Promise<IApiResponse<IWarehouse>> => {
    const response = await http.post<IApiResponse<IWarehouse>>('/warehouse/getOne', { _id: id });
    return response as any;
  },

  getPrimary: async (): Promise<IApiResponse<IWarehouse>> => {
    const response = await http.get<IApiResponse<IWarehouse>>('/warehouse/primary');
    return response as any;
  },
  
  update: async (id: string, data: any): Promise<IApiResponse<IWarehouse>> => {
    const response = await http.put<IApiResponse<IWarehouse>>(`/warehouse/${id}`, data);
    return response as any;
  }
};

export default warehouseService;
