import axiosInstance from './http';
import type { IReturnFilters } from '../types/return.types';

export const returnService = {
    getAll: (params: IReturnFilters) => 
        axiosInstance.post('/return/getAll', params),
    
    getWithPagination: (params: IReturnFilters & { page?: number; limit?: number }) => 
        axiosInstance.post('/return/getWithPagination', params),
    
    getOne: (id: string) => 
        axiosInstance.post(`/return/getOne/${id}`),
    
    updateStatus: (id: string, data: { status: string; adminNotes?: string }) => 
        axiosInstance.patch(`/return/${id}/status`, data),
};
