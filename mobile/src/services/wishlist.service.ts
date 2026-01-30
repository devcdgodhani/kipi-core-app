import http from './http';
import type { Wishlist, AddToWishlistRequest, UpdateWishlistRequest } from '../types/wishlist.types';

const WISHLIST_BASE_URL = '/wishlist';

export const wishlistService = {
  // Get user's wishlist
  getByUser: async (userId: string): Promise<Wishlist> => {
    const response: any = await http.post(`${WISHLIST_BASE_URL}/getOne`, { userId });
    return response.data;
  },

  // Create wishlist
  create: async (data: AddToWishlistRequest): Promise<Wishlist> => {
    const response: any = await http.post(WISHLIST_BASE_URL, data);
    return response.data;
  },

  // Update wishlist
  update: async (wishlistId: string, data: UpdateWishlistRequest): Promise<void> => {
    return http.put(`${WISHLIST_BASE_URL}/${wishlistId}`, data);
  },

  // Delete wishlist
  delete: async (wishlistId: string): Promise<void> => {
    return http.delete(`${WISHLIST_BASE_URL}/deleteByFilter`, { data: { _id: wishlistId } });
  },
};
