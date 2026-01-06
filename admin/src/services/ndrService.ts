import http from './http';
import type { IApiResponse, IPaginationData } from '../types/common';

export interface INDR {
  _id: string;
  shipmentId: string;
  orderId: string;
  awb: string;
  ndrDate: string;
  ndrReason: string;
  ndrReasonText: string;
  attemptNumber: number;
  status: string;
  customerAction?: string;
  rescheduledDate?: string;
  updatedAddress?: any;
  createdAt: string;
}

const ndrService = {
  getAll: async (filters: any = {}, page: number = 1, limit: number = 10): Promise<IApiResponse<IPaginationData<INDR>>> => {
    const response = await http.post<IApiResponse<IPaginationData<INDR>>>('/ndr/getWithPagination', { 
      page, 
      limit, 
      ...filters 
    });
    return response as any;
  },

  resolve: async (ndrId: string, data: any): Promise<IApiResponse<INDR>> => {
    const response = await http.post<IApiResponse<INDR>>(`/ndr/resolve/${ndrId}`, data);
    return response as any;
  },

  getOne: async (id: string): Promise<IApiResponse<INDR>> => {
    const response = await http.get<IApiResponse<INDR>>(`/ndr/${id}`);
    return response as any;
  }
};

export default ndrService;
