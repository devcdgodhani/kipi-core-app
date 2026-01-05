import axiosInstance from './http';
import type { IInventoryAuditFilters } from '../types/inventoryAudit';

export const inventoryAuditService = {
    getWithPagination: async (filters: IInventoryAuditFilters) => {
        const response = await axiosInstance.post('/inventory-audit/getWithPagination', filters);
        return response;
    },

    getOne: async (id: string) => {
        const response = await axiosInstance.get(`/inventory-audit/getOne/${id}`);
        return response;
    }
};
