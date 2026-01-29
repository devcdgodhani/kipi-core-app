import axiosInstance from './http';
import type { CustomerAppSettingsResponse, CustomerAppSettings } from '../types/customerAppSettings.types';

export const getActiveAppSettings = async (): Promise<CustomerAppSettings> => {
  const response = await axiosInstance.get<any, CustomerAppSettingsResponse>('/app-settings/active');
  return response.data;
};
