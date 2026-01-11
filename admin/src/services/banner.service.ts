
import axiosInstance from './http';
import type { 
    Banner, 
    BannerListResponse, 
    BannerResponse 
} from '../types/banner.types';

const BASE_URL = '/banner';

export const bannerService = {
    getAll: async (params?: any): Promise<BannerListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getAll`, params);
    },

    getWithPagination: async (params?: any): Promise<BannerListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getWithPagination`, params);
    },

    getOne: async (id: string): Promise<BannerResponse> => {
        return axiosInstance.post(`${BASE_URL}/getOne`, { _id: id });
    },

    create: async (data: Partial<Banner>): Promise<BannerResponse> => {
        return axiosInstance.post(`${BASE_URL}`, data);
    },

    updateById: async (id: string, data: Partial<Banner>): Promise<BannerResponse> => {
        return axiosInstance.put(`${BASE_URL}/${id}`, data);
    },

    deleteByFilter: async (id: string): Promise<{ message: string }> => {
        return axiosInstance.delete(`${BASE_URL}/deleteByFilter`, { data: { _id: id } });
    }
};
