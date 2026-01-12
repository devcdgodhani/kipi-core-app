import http from './http';
import type { IApiResponse, IPaginationData } from '../types/common';
import type { IShipment, IShipmentFilters } from '../types/shipment.types';

class ShipmentService {
  async getWithPagination(filters: IShipmentFilters, page = 1, limit = 10): Promise<IPaginationData<IShipment>> {
    const response = await http.post<IPaginationData<IShipment>>('/shipment/getWithPagination', {
      ...filters,
      page,
      limit
    });
    return response.data;
  }

  async getById(id: string): Promise<IShipment> {
    const response = await http.get<IShipment>(`/shipment/${id}`);
    return response.data;
  }

  async create(orderId: string, courierId?: number): Promise<IShipment> {
    const response = await http.post<IShipment>('/shipment', { orderId, courierId });
    return response.data;
  }

  async track(awb: string): Promise<any> {
    const response = await http.get(`/shipment/track/${awb}`);
    return response.data;
  }

  async cancel(id: string): Promise<boolean> {
    await http.post(`/shipment/cancel/${id}`);
    return true;
  }

  async resolveNDR(id: string, resolution: 'RE-ATTEMPT' | 'RTO-CONFIRMED', notes?: string): Promise<boolean> {
    await http.post(`/shipment/resolve-ndr/${id}`, { resolution, notes });
    return true;
  }

  async generateLabel(id: string): Promise<{ labelUrl: string; manifestUrl?: string }> {
    const response = await http.post<any, IApiResponse<{ labelUrl: string; manifestUrl?: string }>>(`/shipment/generate-label/${id}`);
    return response.data;
  }
}

export default new ShipmentService();
