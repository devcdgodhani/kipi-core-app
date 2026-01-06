import http from './http';
import type { ICourier, ICourierFilters } from '../types/courier.types';

class CourierService {
  async getAll(filters?: ICourierFilters): Promise<ICourier[]> {
    const response = await http.post<ICourier[]>('/courier/list', filters);
    return response.data;
  }

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    await http.patch(`/courier/${id}/status`, { isActive });
    return true;
  }
}

export default new CourierService();
