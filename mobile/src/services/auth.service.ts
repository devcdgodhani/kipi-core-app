import axiosInstance from './http';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
    countryCode?: string;
    usedReferralCode?: string;
    type: string;
}

interface TokenObject {
    token: string;
    type: string;
    userId: string;
    expiredAt: number;
    createdAt: string;
    updatedAt: string;
    id: string;
}

interface VerifyOTPData {
    otp: string;
}

export const authService = {
    register: async (data: RegisterData): Promise<any> => {
        const response: any = await axiosInstance.post('/auth/register', data);
        
        // The interceptor returns response.data (the body)
        // Body: { status, message, data: { tokens, ...user } }
        const payload = response?.data || response;
        if (payload) {
             const userToStore = payload.user || payload;
             await AsyncStorage.setItem('user', JSON.stringify(userToStore));

             const tokens = payload.tokens;
             if (tokens && Array.isArray(tokens)) {
                for (const tokenObj of tokens) {
                    if (tokenObj.type && tokenObj.token) {
                        await AsyncStorage.setItem(tokenObj.type, tokenObj.token);
                    }
                }
             }
        }
        
        return response;
    },

    verifyOTP: async (data: VerifyOTPData): Promise<any> => {
        const otpToken = await AsyncStorage.getItem('OTP_TOKEN');
        const response: any = await axiosInstance.post('/auth/verifyOtp', data, {
            headers: { Authorization: `Bearer ${otpToken}` },
        });
        await AsyncStorage.removeItem('OTP_TOKEN');
        return response;
    },

    login: async (credentials: { email: string; password: string }) => {
        const response: any = await axiosInstance.post('/auth/login', { ...credentials, type: 'CUSTOMER' });
        if (response) {
             const payload = response.data || response;
             if (payload) {
                 // Store only user object, not tokens
                 const userToStore = payload.user || payload;
                 await AsyncStorage.setItem('user', JSON.stringify(userToStore));
                 
                 if (payload.tokens && Array.isArray(payload.tokens)) {
                    for (const tokenObj of payload.tokens) {
                        await AsyncStorage.setItem(tokenObj.type, tokenObj.token);
                    }
                 }
             }
        }
        return response;
    },

    sendOtp: async (data: { email: string; type: string; otpType: string }): Promise<any> => {
        const response = await axiosInstance.post('/auth/sendOtp', data);
        // Store tokens in AsyncStorage (especially OTP_TOKEN)
        if (response?.data && Array.isArray(response?.data?.tokens)) {
            for (const tokenObj of response.data.tokens) {
                if (tokenObj.type && tokenObj.token) {
                    await AsyncStorage.setItem(tokenObj.type, tokenObj.token);
                }
            }
        }
        return response;
    },

    logout: async () => {
        const response = await axiosInstance.post('/auth/logout');
        await AsyncStorage.clear();
        return response;
    },

    changePassword: async (data: any): Promise<any> => {
        const response = await axiosInstance.post('/auth/changePassword', data);
        return response;
    },

    getMe: async (): Promise<any> => {
        const response = await axiosInstance.get('/auth/me');
        return response;
    },

    resetPassword: async (data: { newPassword: string }): Promise<any> => {
        const forgetPasswordToken = await AsyncStorage.getItem('FORGET_PASSWORD_TOKEN');
        const response = await axiosInstance.post('/auth/forgetPassword', data, {
            headers: {
                Authorization: `Bearer ${forgetPasswordToken}`,
            },
        });
        
        // Clear the token after successful reset
        await AsyncStorage.removeItem('FORGET_PASSWORD_TOKEN');
        
        return response;
    },
    
    refreshToken: async (data: { refreshToken: string }): Promise<any> => {
        const response = await axiosInstance.post('/auth/refreshTokens', data);
         if (response?.data && Array.isArray(response?.data?.tokens)) {
            for (const tokenObj of response.data.tokens) {
                if (tokenObj.type && tokenObj.token) {
                    await AsyncStorage.setItem(tokenObj.type, tokenObj.token);
                }
            }
        }
        return response;
    }
};
