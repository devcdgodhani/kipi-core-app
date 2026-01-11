
import http from './http';
import type { NotificationResponse } from '../types/notification.types';

const BASE_URL = '/notification';

export const notificationService = {
    getMyNotifications: async (params?: any): Promise<NotificationResponse> => {
        const response: any = await http.post(`${BASE_URL}/getMyNotifications`, params || {});
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response: any = await http.get(`${BASE_URL}/getUnreadCount`);
        return response.data;
    },

    markAsRead: async (notificationIds: string[]): Promise<void> => {
        await http.put(`${BASE_URL}/markAsRead`, { notificationIds });
    },

    markAllAsRead: async (): Promise<void> => {
        await http.put(`${BASE_URL}/markAllAsRead`);
    }
};
