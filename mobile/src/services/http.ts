import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance: AxiosInstance = axios.create({
  baseURL:'http://10.10.10.168:3000/api/v1/customer', // Update this for production
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('ACCESS_TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;                                    
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('ACCESS_TOKEN');
      await AsyncStorage.removeItem('REFRESH_TOKEN');
      // Navigation to login will be handled by navigation guard
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
