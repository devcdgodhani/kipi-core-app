
import axiosInstance from './http';
import type { 
    SearchQuery, 
    SearchQueryListResponse, 
    SearchQueryResponse 
} from '../types/searchQuery.types';

const BASE_URL = '/search-query';

export const searchQueryService = {
    getAll: async (params?: any): Promise<SearchQueryListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getAll`, params);
    },

    getWithPagination: async (params?: any): Promise<SearchQueryListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getWithPagination`, params);
    },

    getOne: async (id: string): Promise<SearchQueryResponse> => {
        return axiosInstance.post(`${BASE_URL}/getOne`, { _id: id });
    },

    updateById: async (id: string, data: Partial<SearchQuery>): Promise<SearchQueryResponse> => {
        return axiosInstance.put(`${BASE_URL}/${id}`, data);
    },

    deleteByFilter: async (id: string): Promise<{ message: string }> => {
        return axiosInstance.delete(`${BASE_URL}/deleteByFilter`, { data: { _id: id } });
    }
};
