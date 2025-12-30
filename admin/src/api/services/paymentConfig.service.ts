import { apiCall } from '../middleware/apiCall';

export interface PaymentConfig {
  _id: string;
  entityType: 'CATEGORY' | 'PRODUCT';
  entityId: string;
  codEnabled: boolean;
  prepaidEnabled: boolean;
  codCharges?: {
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
  };
  minOrderValue?: number;
  maxCodAmount?: number;
}

export interface CreatePaymentConfigData {
  entityType: 'CATEGORY' | 'PRODUCT';
  entityId: string;
  codEnabled: boolean;
  prepaidEnabled: boolean;
  codCharges?: {
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
  };
  minOrderValue?: number;
  maxCodAmount?: number;
}

export const paymentConfigService = {
  // Standardized Methods
  getOne: async (params: any) => {
    const response = await apiCall.get('/admin/payment-config/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any) => {
    const response = await apiCall.get('/admin/payment-config/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any) => {
    const response = await apiCall.get('/admin/payment-config/getWithPagination', { params });
    return response.data;
  },

  create: async (data: CreatePaymentConfigData) => {
    const response = await apiCall.post('/admin/payment-config', data);
    return response.data;
  },

  bulkCreate: async (data: CreatePaymentConfigData[]) => {
    const response = await apiCall.post('/admin/payment-config/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePaymentConfigData>) => {
    const response = await apiCall.put('/admin/payment-config/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateById: async (id: string, data: Partial<CreatePaymentConfigData>) => {
    const response = await apiCall.put('/admin/payment-config/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/payment-config/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/payment-config/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall.delete('/admin/payment-config/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteById: async (id: string) => {
    const response = await apiCall.delete('/admin/payment-config/deleteByFilter', { data: { _id: id } });
    return response.data;
  },

  deleteByFilter: async (filter: object) => {
    const response = await apiCall.delete('/admin/payment-config/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string) => {
    const response = await apiCall.get('/admin/payment-config/getOne', { params: { _id: id } });
    return response.data;
  },

  // Specialized Methods
  setConfig: async (data: CreatePaymentConfigData) => {
    const response = await apiCall.post('/admin/payment-config', data);
    return response.data;
  },

  getConfig: async (entityType: string, entityId: string) => {
    const response = await apiCall.get('/admin/payment-config', { params: { entityType, entityId } });
    return response.data;
  },

  getEffectiveConfig: async (productId: string) => {
    const response = await apiCall.get(`/admin/payment-config/product/${productId}`);
    return response.data;
  },
};
