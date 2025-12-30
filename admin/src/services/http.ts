import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('REFRESH_TOKEN');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
