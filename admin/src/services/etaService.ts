import http from './http';
import type { IEtaOption } from '../types/eta.types';

class EtaService {
  async calculate(pickupPincode: string, deliveryPincode: string, weight: number, cod: boolean): Promise<IEtaOption[]> {
    const response = await http.post<IEtaOption[]>('/eta/calculate', {
      pickupPincode,
      deliveryPincode,
      weight,
      cod
    });
    return response.data;
  }
}

export default new EtaService();
