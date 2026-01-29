import axiosInstance from './http';
import type { CustomerAppSettings, CustomerAppSettingsResponse } from '../types/customerAppSettings.types';

class CustomerAppSettingsService {
  private baseUrl = '/customer-app-settings';

  async getActiveSettings(): Promise<CustomerAppSettings | null> {
    try {
      const response = await axiosInstance.get<any, CustomerAppSettingsResponse>(`${this.baseUrl}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active settings:', error);
      return null;
    }
  }

  async updateSettings(data: Partial<CustomerAppSettings>): Promise<CustomerAppSettings> {
    const response = await axiosInstance.put<any, CustomerAppSettingsResponse>(`${this.baseUrl}/update`, data);
    return response.data;
  }

  async createSettings(data: Partial<CustomerAppSettings>): Promise<CustomerAppSettings> {
    const response = await axiosInstance.post<any, CustomerAppSettingsResponse>(this.baseUrl, data);
    return response.data;
  }

  async getAll(): Promise<CustomerAppSettings[]> {
    const response = await axiosInstance.get<any, { data: CustomerAppSettings[] }>(`${this.baseUrl}/getAll`);
    return response.data;
  }

  async getById(id: string): Promise<CustomerAppSettings> {
    const response = await axiosInstance.get<any, CustomerAppSettingsResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async deleteById(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const customerAppSettingsService = new CustomerAppSettingsService();
