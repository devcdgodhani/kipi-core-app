import axiosInstance from './http';
import type { IReturnFilters } from '../types/return.types';

export const returnService = {
    getAll: (params: IReturnFilters) => 
        axiosInstance.get('/return', { params }),
    
    getWithPagination: (params: IReturnFilters & { page?: number; limit?: number }) => 
        axiosInstance.get('/return', { params }),
    
    getOne: (id: string) => 
        axiosInstance.get(`/return/${id}`),
    
    updateStatus: (id: string, data: { status: string; adminNotes?: string }) => 
        axiosInstance.patch(`/return/${id}/status`, data),
};
