import { apiCall } from '../middleware/apiCall';
import type { 
  TLoginRes, 
  TRegisterRes, 
  TVerifyOtpRes,
  TRefreshTokensRes,
  IApiResponse, 
  IUser,
  OTP_TYPE,
  USER_TYPE
} from '../../types';

export const authService = {
  login: async (data: any): Promise<TLoginRes> => {
    const response = await apiCall.post<TLoginRes>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: any): Promise<TRegisterRes> => {
    const response = await apiCall.post<TRegisterRes>('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: { otp?: string; token?: string; otpType?: string }): Promise<TVerifyOtpRes> => {
    const response = await apiCall.post<TVerifyOtpRes>('/auth/verifyOtp', data);
    return response.data;
  },

  sendOtp: async (data: { username: string; type: USER_TYPE; otpType: OTP_TYPE }): Promise<IApiResponse> => {
    const response = await apiCall.post<IApiResponse>('/auth/sendOtp', data);
    return response.data;
  },

  refreshTokens: async (refreshToken: string): Promise<TRefreshTokensRes> => {
    const response = await apiCall.post<TRefreshTokensRes>('/auth/refreshTokens', { refreshToken });
    return response.data;
  },

  logout: async (): Promise<IApiResponse> => {
    const response = await apiCall.post<IApiResponse>('/auth/logout');
    return response.data;
  },

  changePassword: async (data: any): Promise<IApiResponse> => {
    const response = await apiCall.post<IApiResponse>('/auth/changePassword', data);
    return response.data;
  },

  forgetPassword: async (data: { newPassword: string }): Promise<IApiResponse> => {
    const response = await apiCall.post<IApiResponse>('/auth/forgetPassword', data);
    return response.data;
  },

  getLoggedInUser: async (): Promise<IApiResponse<IUser>> => {
    const response = await apiCall.get<IApiResponse<IUser>>('/auth/loggedInUser');
    return response.data;
  }
};
