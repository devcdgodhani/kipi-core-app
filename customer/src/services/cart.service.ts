import http from './http';
import type { Cart, AddToCartRequest, UpdateCartRequest } from '../types/cart.types';

const CART_BASE_URL = '/cart';

export const cartService = {
  // Get user's cart
  getByUser: async (userId: string): Promise<Cart> => {
    const response: any = await http.post(`${CART_BASE_URL}/getOne`, { userId });
    return response.data;
  },

  // Create cart
  create: async (data: AddToCartRequest): Promise<Cart> => {
    const response: any = await http.post(CART_BASE_URL, data);
    return response.data;
  },

  // Update cart
  update: async (cartId: string, data: UpdateCartRequest): Promise<void> => {
    return http.put(`${CART_BASE_URL}/${cartId}`, data);
  },

  // Delete cart
  delete: async (cartId: string): Promise<void> => {
    return http.delete(`${CART_BASE_URL}/deleteByFilter`, { data: { _id: cartId } });
  },
};
