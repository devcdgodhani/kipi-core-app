import axiosInstance from './http';
import type { IReturn, IReturnFilters } from '../types/return.types';

export const returnService = {
    getAll: (params: IReturnFilters) => 
        axiosInstance.get('/admin/return', { params }),
    
    getWithPagination: (params: IReturnFilters & { page?: number; limit?: number }) => 
        axiosInstance.get('/admin/return', { params }),
    
    getOne: (id: string) => 
        axiosInstance.get(`/admin/return/${id}`),
    
    updateStatus: (id: string, data: { status: string; adminNotes?: string }) => 
        axiosInstance.patch(`/admin/return/${id}/status`, data),
};
