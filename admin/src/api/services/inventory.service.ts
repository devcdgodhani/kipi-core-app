import { apiCall } from '../middleware/apiCall';

export interface Inventory {
  _id: string;
  sku: any;
  totalQuantity: number;
  totalAvailableStock: number;
  totalReservedStock: number;
  lowStockThreshold: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  lastRestockedDate?: string;
}

export const inventoryService = {
  // Standardized Methods
  getOne: async (params: any) => {
    const response = await apiCall.get('/admin/inventory/getOne', { params });
    return response.data;
  },

  getAll: async (params?: any) => {
    const response = await apiCall.get('/admin/inventory/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params?: any) => {
    const response = await apiCall.get('/admin/inventory/getWithPagination', { params });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiCall.post('/admin/inventory', data);
    return response.data;
  },

  bulkCreate: async (data: any[]) => {
    const response = await apiCall.post('/admin/inventory/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiCall.put('/admin/inventory/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/inventory/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/inventory/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall.delete('/admin/inventory/deleteByFilter', {
      data: { _id: id }
    });
    return response.data;
  },

  deleteByFilter: async (filter: object) => {
    const response = await apiCall.delete('/admin/inventory/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string) => {
    const response = await apiCall.get('/admin/inventory/getOne', { params: { _id: id } });
    return response.data;
  },

  // Specialized Methods
  getStock: async (skuId: string) => {
    const response = await apiCall.get(`/admin/inventory/sku/${skuId}`);
    return response.data;
  },

  adjustStock: async (skuId: string, quantity: number, reason: string, lotId?: string) => {
    const response = await apiCall.post('/admin/inventory/adjust', { skuId, quantity, reason, lotId });
    return response.data;
  },

  reserveStock: async (skuId: string, quantity: number) => {
    const response = await apiCall.post('/admin/inventory/reserve', { skuId, quantity });
    return response.data;
  },

  releaseStock: async (skuId: string, quantity: number) => {
    const response = await apiCall.post('/admin/inventory/release', { skuId, quantity });
    return response.data;
  },

  getLowStockItems: async () => {
    const response = await apiCall.get('/admin/inventory/low-stock');
    return response.data;
  },

  updateThreshold: async (skuId: string, threshold: number) => {
    const response = await apiCall.post('/admin/inventory/threshold', { skuId, threshold });
    return response.data;
  },

  getStockValue: async () => {
    const response = await apiCall.get('/admin/inventory/value');
    return response.data;
  },
};
