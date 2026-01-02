import axiosInstance from './http';
import type { IInventoryAuditFilters } from '../types/inventoryAudit';

export const inventoryAuditService = {
    getWithPagination: async (filters: IInventoryAuditFilters) => {
        const response = await axiosInstance.post('/admin/inventory-audit/getWithPagination', filters);
        return response.data.data;
    },

    getOne: async (id: string) => {
        const response = await axiosInstance.get(`/admin/inventory-audit/getOne/${id}`);
        return response.data.data;
    }
};
