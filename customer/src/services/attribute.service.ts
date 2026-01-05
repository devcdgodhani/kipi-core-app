import http from './http';
import type { Attribute } from '../types/attribute.types';

const ATTRIBUTE_BASE_URL = '/attribute';

export const attributeService = {
  getAllFilterable: async (): Promise<Attribute[]> => {
    const response: any = await http.post(`${ATTRIBUTE_BASE_URL}/getAll`, {
      status: 'ACTIVE',
      isFilterable: true
    });
    return response.data;
  }
};
