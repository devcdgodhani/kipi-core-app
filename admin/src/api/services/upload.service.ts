import { apiCall } from '../middleware/apiCall';
import { type IApiResponse } from '../../types';

interface UploadResponse {
    url: string;
    key: string;
}

export const uploadService = {
    uploadImage: async (file: File): Promise<IApiResponse<UploadResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiCall.post<IApiResponse<UploadResponse>>('/admin/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getOne: async (params: any) => {
        const response = await apiCall.get('/admin/upload/getOne', { params });
        return response.data;
    },

    getAll: async (params?: any) => {
        const response = await apiCall.get('/admin/upload/getAll', { params });
        return response.data;
    },

    getWithPagination: async (params?: any) => {
        const response = await apiCall.get('/admin/upload/getWithPagination', { params });
        return response.data;
    },

    updateOneByFilter: async (data: { filter: object; update: object }) => {
        const response = await apiCall.put('/admin/upload/updateOneByFilter', data);
        return response.data;
    },

    updateManyByFilter: async (data: { filter: object; update: object }) => {
        const response = await apiCall.put('/admin/upload/updateManyByFilter', data);
        return response.data;
    },

    bulkCreate: async (data: any[]) => {
        const response = await apiCall.post('/admin/upload/bulkCreate', data);
        return response.data;
    },

    deleteByFilter: async (filter: object) => {
        const response = await apiCall.delete('/admin/upload/deleteByFilter', { data: filter });
        return response.data;
    }
};
