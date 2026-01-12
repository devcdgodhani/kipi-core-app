import http from './http';
import type { IEtaOption } from '../types/eta.types';
import type { IApiResponse } from '../types/common';

class EtaService {
  async calculate(pickupPincode: string, deliveryPincode: string, weight: number, cod: boolean): Promise<IApiResponse<IEtaOption[]>> {
    return http.post<any, IApiResponse<IEtaOption[]>>('/eta/calculate', {
      pickupPincode,
      deliveryPincode,
      weight,
      cod
    });
  }
}

export default new EtaService();
