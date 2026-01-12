import http from './http';
import type { IApiResponse, IPaginationData } from '../types/common';
import type { IRtoScore, IRtoStats } from '../types/rto.types';

class RtoService {
  async calculateScore(data: { userId: string, pincode: string, orderAmount: number, paymentMethod: string }) {
    return http.post<any, IApiResponse<any>>('/rto/calculate', data);
  }

  async getStats() {
    return http.get<any, IApiResponse<IRtoStats>>('/rto/stats');
  }

  async getWithPagination(filters: any) {
    return http.post<any, IApiResponse<IPaginationData<IRtoScore>>>('/rto/getWithPagination', filters);
  }

  async getOne(id: string) {
    return http.get<any, IApiResponse<IRtoScore>>(`/rto/getOne/${id}`);
  }
  
  async deleteByFilter(filter: any) {
      return http.delete<any, IApiResponse<any>>('/rto/deleteByFilter', { data: filter });
  }
}

export default new RtoService();
