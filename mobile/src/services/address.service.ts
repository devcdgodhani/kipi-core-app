import http from './http';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../types/address.types';

const ADDRESS_BASE_URL = '/address';

export const addressService = {
  // Get all addresses for a user
  getByUser: async (userId: string): Promise<Address[]> => {
    const response: any = await http.post(`${ADDRESS_BASE_URL}/getAll`, { userId, status: 'ACTIVE' });
    return response.data;
  },

  // Get default address
  getDefault: async (userId: string): Promise<Address | null> => {
    const response: any = await http.post(`${ADDRESS_BASE_URL}/getOne`, { userId, isDefault: true });
    return response.data;
  },

  // Create address
  create: async (data: CreateAddressRequest): Promise<Address> => {
    const response: any = await http.post(ADDRESS_BASE_URL, data);
    return response.data;
  },

  // Update address
  update: async (addressId: string, data: UpdateAddressRequest): Promise<void> => {
    return http.put(`${ADDRESS_BASE_URL}/${addressId}`, data);
  },

  // Delete address
  delete: async (addressId: string): Promise<void> => {
    return http.delete(`${ADDRESS_BASE_URL}/deleteByFilter`, { data: { _id: addressId } });
  },

  // Set as default
  setDefault: async (addressId: string): Promise<void> => {
    return http.put(`${ADDRESS_BASE_URL}/${addressId}`, { isDefault: true });
  },
};
