import http from './http';
import type { Order, CreateOrderRequest, OrderListResponse } from '../types/order.types';

const ORDER_BASE_URL = '/order';

export const orderService = {
  // Create order
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response: any = await http.post(`${ORDER_BASE_URL}/create`, data);
    return response.data;
  },

  // Get my orders
  getMyOrders: async (filters?: any): Promise<OrderListResponse> => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getMyOrders`, filters);
    return response.data;
  },

  // Get order by ID
  getById: async (id: string): Promise<Order> => {
    const response: any = await http.get(`${ORDER_BASE_URL}/getOne/${id}`);
    return response.data;
  }
};
