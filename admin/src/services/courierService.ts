import http from './http';
import type { ICourier, ICourierFilters } from '../types/courier.types';

class CourierService {
  async getWithPagination(filters: ICourierFilters & { page?: number; limit?: number } = {}): Promise<{ data: ICourier[]; totalRecords: number; totalPages: number; currentPage: number; limit: number }> {
    const response = await http.post<any>('/courier/getWithPagination', filters);
    return response.data;
  }

  async getAll(filters?: ICourierFilters): Promise<ICourier[]> {
    const response = await http.post<any>('/courier/getAll', filters);
    return response.data;
  }

  async getById(id: string): Promise<ICourier> {
    const response = await http.post<any>(`/courier/getOne`, { _id: id });
    return response.data;
  }

  async create(data: Partial<ICourier>): Promise<ICourier> {
    const response = await http.post<any>('/courier', data);
    return response.data;
  }

  async update(id: string, data: Partial<ICourier>): Promise<ICourier> {
    const response = await http.put<any>(`/courier/${id}`, data);
    return response.data;
  }

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    await http.patch(`/courier/${id}/status`, { isActive });
    return true;
  }
}

export default new CourierService();
