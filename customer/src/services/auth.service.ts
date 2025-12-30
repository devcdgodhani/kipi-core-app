import axiosInstance from './http';

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobile?: string;
    countryCode?: string;
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
        const response = await axiosInstance.post('/auth/register', data);
        
        // Store tokens in localStorage
        if (response?.data && Array.isArray(response?.data?.tokens)) {
            response.data.tokens.forEach((tokenObj: TokenObject) => {
                if (tokenObj.type && tokenObj.token) {
                    localStorage.setItem(tokenObj.type, tokenObj.token);
                }
            });
        }
        
        return response;
    },

    verifyOTP: async (data: VerifyOTPData): Promise<any> => {
        // Get OTP_TOKEN from localStorage for authorization
        const otpToken = localStorage.getItem('OTP_TOKEN');
        
        const response = await axiosInstance.post('/auth/verifyOtp', data, {
            headers: {
                Authorization: `Bearer ${otpToken}`,
            },
        });

        // Clear OTP_TOKEN after successful verification
        localStorage.removeItem('OTP_TOKEN');
        
        return response;
    },

    login: async (credentials: { email: string; password: string }) => {
        const response = await axiosInstance.post('/auth/login', { ...credentials, type: 'CUSTOMER' });
        if (response?.data?.data) {
             const { tokens, ...user } = response.data.data;
             localStorage.setItem('user', JSON.stringify(user));
             
             if (tokens && Array.isArray(tokens)) {
                 tokens.forEach((tokenObj: any) => {
                     if (tokenObj.type && tokenObj.token) {
                         localStorage.setItem(tokenObj.type, tokenObj.token);
                     }
                 });
             }
        }
        return response;
    },

    sendOtp: async (data: { email: string; type: string; otpType: string }): Promise<any> => {
        const response = await axiosInstance.post('/auth/sendOtp', data);
        // Store tokens in localStorage (especially OTP_TOKEN)
        if (response?.data && Array.isArray(response?.data?.tokens)) {
            response.data.tokens.forEach((tokenObj: any) => {
                if (tokenObj.type && tokenObj.token) {
                    localStorage.setItem(tokenObj.type, tokenObj.token);
                }
            });
        }
        return response;
    },

    logout: async () => {
        const response = await axiosInstance.post('/auth/logout');
        localStorage.clear();
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
        const forgetPasswordToken = localStorage.getItem('FORGET_PASSWORD_TOKEN');
        const response = await axiosInstance.post('/auth/forgetPassword', data, {
            headers: {
                Authorization: `Bearer ${forgetPasswordToken}`,
            },
        });
        
        // Clear the token after successful reset
        localStorage.removeItem('FORGET_PASSWORD_TOKEN');
        
        return response;
    },
    
    refreshToken: async (data: { refreshToken: string }): Promise<any> => {
        const response = await axiosInstance.post('/auth/refreshTokens', data);
         if (response?.data && Array.isArray(response?.data?.tokens)) {
            response.data.tokens.forEach((tokenObj: any) => {
                if (tokenObj.type && tokenObj.token) {
                    localStorage.setItem(tokenObj.type, tokenObj.token);
                }
            });
        }
        return response;
    }
};
