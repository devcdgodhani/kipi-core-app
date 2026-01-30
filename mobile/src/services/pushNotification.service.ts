
import http from './http';

const BASE_URL = '/push-notification';

export const pushNotificationService = {
    registerDevice: async (fcmToken: string, deviceType: 'ANDROID' | 'IOS' | 'WEB'): Promise<void> => {
        await http.post(`${BASE_URL}/register-device`, { fcmToken, deviceType });
    },

    unregisterDevice: async (fcmToken: string): Promise<void> => {
        await http.post(`${BASE_URL}/unregister-device`, { fcmToken });
    }
};
