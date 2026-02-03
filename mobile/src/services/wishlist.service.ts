import http from './http';
import type { Wishlist, AddToWishlistRequest, UpdateWishlistRequest } from '../types/wishlist.types';

const WISHLIST_BASE_URL = '/wishlist';

export const wishlistService = {
  // Get user's wishlist
  getMyWishlist: async (): Promise<any> => {
    const response: any = await http.post(`${WISHLIST_BASE_URL}/getOne`, {});
    return response.data;
  },

  // Add to wishlist - Backend uses a single document with products array
  addToWishlist: async (productId: string): Promise<any> => {
    // We first need to get the wishlist to see if it exists
    let wishlist: any;
    try {
      wishlist = await wishlistService.getMyWishlist();
    } catch (e) {
      wishlist = null;
    }

    if (!wishlist) {
      // Create new wishlist if doesn't exist
      return http.post(WISHLIST_BASE_URL, {
        products: [{ productId, addedAt: new Date() }]
      });
    } else {
      // Update existing wishlist
      const products = [...(wishlist.products || [])];
      if (!products.find((p: any) => p.productId === productId)) {
        products.push({ productId, addedAt: new Date() });
      }
      return http.put(`${WISHLIST_BASE_URL}/${wishlist._id}`, { products });
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId: string): Promise<any> => {
    const wishlist: any = await wishlistService.getMyWishlist();
    if (wishlist && wishlist.products) {
      const products = wishlist.products.filter((p: any) => p.productId?._id !== productId && p.productId !== productId);
      return http.put(`${WISHLIST_BASE_URL}/${wishlist._id}`, { products });
    }
  },

  // Legacy/Generic methods
  getByUser: async (userId: string): Promise<Wishlist> => {
    const response: any = await http.post(`${WISHLIST_BASE_URL}/getOne`, { userId });
    return response.data;
  },

  create: async (data: AddToWishlistRequest): Promise<Wishlist> => {
    const response: any = await http.post(WISHLIST_BASE_URL, data);
    return response.data;
  },

  update: async (wishlistId: string, data: UpdateWishlistRequest): Promise<void> => {
    return http.put(`${WISHLIST_BASE_URL}/${wishlistId}`, data);
  },

  delete: async (wishlistId: string): Promise<void> => {
    return http.delete(`${WISHLIST_BASE_URL}/deleteByFilter`, { data: { _id: wishlistId } });
  },
};
