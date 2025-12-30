import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from './TokenManager';
import { API_BASE_URL } from '../../constants';
import { TOKEN_TYPE } from '../../types';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Handle 401 error and retry with refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('Node access denied. Attempting credential refresh...', error.response?.data);
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          console.error('Refresh frequency not found.');
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refreshTokens`, {
          refreshToken,
        }, {
          headers: {
            'Authorization': `Bearer ${TokenManager.getAccessToken()}`
          }
        });

        // Backend returns response.data.data.tokens where each token has type and token
        const { tokens } = response.data.data;
        const accessTokenObj = tokens.find((t: any) => t.type === TOKEN_TYPE.ACCESS_TOKEN);
        const refreshTokenObj = tokens.find((t: any) => t.type === TOKEN_TYPE.REFRESH_TOKEN);
        
        const newAccessToken = accessTokenObj?.token;
        const newRefreshToken = refreshTokenObj?.token;

        if (newAccessToken) {
          console.log('Credentials synchronized successfully.');
          TokenManager.setAccessToken(newAccessToken);
          if (newRefreshToken) TokenManager.setRefreshToken(newRefreshToken);

          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError: any) {
        console.error('Nexus connection lost. Terminating session.', refreshError.response?.data || refreshError.message);
        TokenManager.clearTokens();
        // Redirect to login or dispatch logout if needed
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiCall = apiClient;
