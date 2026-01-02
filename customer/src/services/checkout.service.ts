import http from './http';
import type { CreateOrderRequest, OrderResponse } from '../types/checkout.types';

const ORDER_BASE_URL = '/order';

export const checkoutService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response: any = await http.post(`${ORDER_BASE_URL}/create`, data);
    return response.data;
  },

  getMyOrders: async (params?: any) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getMyOrders`, params);
    return response.data; // Handles pagination
  },

  getOrderById: async (id: string) => {
      const response: any = await http.get(`${ORDER_BASE_URL}/getOne/${id}`);
      return response.data;
  }
};
