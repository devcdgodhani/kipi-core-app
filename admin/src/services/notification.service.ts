
import axiosInstance from './http';
import type { 
    Notification, 
    NotificationListResponse, 
    NotificationResponse 
} from '../types/notification.types';

const BASE_URL = '/notification';

export const notificationService = {
    getAll: async (params?: any): Promise<NotificationListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getAll`, params);
    },

    getWithPagination: async (params?: any): Promise<NotificationListResponse> => {
        return axiosInstance.post(`${BASE_URL}/getWithPagination`, params);
    },

    getOne: async (id: string): Promise<NotificationResponse> => {
        return axiosInstance.post(`${BASE_URL}/getOne`, { _id: id });
    },

    create: async (data: Partial<Notification>): Promise<NotificationResponse> => {
        return axiosInstance.post(`${BASE_URL}`, data);
    },

    updateById: async (id: string, data: Partial<Notification>): Promise<NotificationResponse> => {
        return axiosInstance.put(`${BASE_URL}/${id}`, data);
    },

    deleteByFilter: async (id: string): Promise<{ message: string }> => {
        return axiosInstance.delete(`${BASE_URL}/deleteByFilter`, { data: { _id: id } });
    }
};
