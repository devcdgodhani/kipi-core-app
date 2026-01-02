import http from './http';
import { Order } from '../types/order.types';

const ORDER_BASE_URL = '/order';

export const orderService = {
  // Get all orders (Admin)
  getAll: async (params?: any) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getWithPagination`, params);
    return response.data;
  },

  // Get single order
  getById: async (id: string) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getOne`, { _id: id });
    return response.data;
  },

  // Update order (e.g., status)
  update: async (id: string, data: Partial<Order>) => {
    const response: any = await http.put(`${ORDER_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete order
  delete: async (id: string) => {
    const response: any = await http.delete(`${ORDER_BASE_URL}/${id}`);
    return response.data;
  }
};
