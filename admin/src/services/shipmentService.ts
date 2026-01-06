import http from './http';
import type { IShipment, IShipmentFilters } from '../types/shipment.types';
import type { IApiResponse, IPaginationData } from '../types/common'; // Assuming common types exist, will check or strictly type

class ShipmentService {
  async getAll(filters: IShipmentFilters, page = 1, limit = 10): Promise<IPaginationData<IShipment>> {
    const response = await http.post<IPaginationData<IShipment>>('/shipment/list', {
      ...filters,
      page,
      limit,
      isPaginate: true
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
    await http.delete(`/shipment/${id}`);
    return true;
  }
}

export default new ShipmentService();
