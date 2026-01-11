
import axiosInstance from './http';
import type { 
    FlashDeal, 
    FlashDealListResponse, 
    FlashDealResponse 
} from '../types/flashDeal.types';

const BASE_URL = '/flash-deal';

export const flashDealService = {
    getAll: async (params?: any): Promise<FlashDealListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getAll`, params);
    },

    getWithPagination: async (params?: any): Promise<FlashDealListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getWithPagination`, params);
    },

    getOne: async (id: string): Promise<FlashDealResponse> => {
        return axiosInstance.post(`${BASE_URL}/getOne`, { _id: id });
    },

    create: async (data: Partial<FlashDeal>): Promise<FlashDealResponse> => {
        return axiosInstance.post(`${BASE_URL}`, data);
    },

    updateById: async (id: string, data: Partial<FlashDeal>): Promise<FlashDealResponse> => {
        return axiosInstance.put(`${BASE_URL}/${id}`, data);
    },

    deleteByFilter: async (id: string): Promise<{ message: string }> => {
        return axiosInstance.delete(`${BASE_URL}/deleteByFilter`, { data: { _id: id } });
    }
};
