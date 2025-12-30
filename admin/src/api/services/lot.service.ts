import { apiCall } from '../middleware/apiCall';

export interface Lot {
  _id: string;
  lotNumber: string;
  sourceType: 'SELF_MANUFACTURE' | 'SUPPLIER';
  supplierId?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  costPerUnit: number;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  damagedQuantity: number;
  purchaseOrderReference?: string;
  qualityCheckStatus: 'PENDING' | 'PASSED' | 'FAILED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLotData {
  lotNumber: string;
  sourceType: 'SELF_MANUFACTURE' | 'SUPPLIER';
  supplierId?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  costPerUnit: number;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  damagedQuantity?: number;
  purchaseOrderReference?: string;
  qualityCheckStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  notes?: string;
}

export interface LotFilters {
  page?: number;
  limit?: number;
  skuId?: string;
  sourceType?: string;
}

export const lotService = {
  // Standardized Methods
  getOne: async (params: { _id?: string; lotNumber?: string }) => {
    const response = await apiCall.get('/admin/lots/getOne', { params });
    return response.data;
  },

  getAll: async (params: any = {}) => {
    const response = await apiCall.get('/admin/lots/getAll', { params });
    return response.data;
  },

  getWithPagination: async (params: LotFilters = {}) => {
    const response = await apiCall.get('/admin/lots/getWithPagination', { params });
    return response.data;
  },

  create: async (data: CreateLotData) => {
    const response = await apiCall.post('/admin/lots', data);
    return response.data;
  },

  bulkCreate: async (data: CreateLotData[]) => {
    const response = await apiCall.post('/admin/lots/bulkCreate', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateLotData>) => {
    const response = await apiCall.put('/admin/lots/updateOneByFilter', {
      filter: { _id: id },
      update: data
    });
    return response.data;
  },

  updateOneByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/lots/updateOneByFilter', data);
    return response.data;
  },

  updateManyByFilter: async (data: { filter: object; update: object }) => {
    const response = await apiCall.put('/admin/lots/updateManyByFilter', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall.delete('/admin/lots/deleteByFilter', {
      data: { _id: id }
    });
    return response.data;
  },

  deleteByFilter: async (filter: object) => {
    const response = await apiCall.delete('/admin/lots/deleteByFilter', { data: filter });
    return response.data;
  },

  // Legacy/Compatibility mapping
  getById: async (id: string) => {
    const response = await apiCall.get('/admin/lots/getOne', { params: { _id: id } });
    return response.data;
  },

  // Specialized Methods
  allocateFromLot: async (id: string, quantity: number) => {
    const response = await apiCall.post(`/admin/lots/${id}/allocate`, { quantity });
    return response.data;
  },

  adjustStock: async (id: string, quantity: number, reason: string) => {
    const response = await apiCall.post(`/admin/lots/${id}/adjust`, { quantity, reason });
    return response.data;
  },

  getExpiringLots: async (days: number = 30) => {
    const response = await apiCall.get('/admin/lots/expiring', { params: { days } });
    return response.data;
  },

  getLotHistory: async (id: string) => {
    const response = await apiCall.get(`/admin/lots/${id}/history`);
    return response.data;
  },
};

