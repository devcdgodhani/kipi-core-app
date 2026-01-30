
import http from './http';
import type { CalculateEtaRequest, EtaResponse } from '../types/eta.types';

const BASE_URL = '/eta';

export const etaService = {
    check: async (data: CalculateEtaRequest): Promise<EtaResponse[]> => {
        const response: any = await http.post(`${BASE_URL}/check`, data);
        return response.data;
    }
};
