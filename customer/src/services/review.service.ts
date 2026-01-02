import http from './http';
import type { Review, CreateReviewRequest } from '../types/review.types';

const REVIEW_BASE_URL = '/review';

export const reviewService = {
  // Get reviews for a product (Public)
  getByProduct: async (productId: string, params?: any): Promise<any> => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/product/${productId}`, params);
    return response.data;
  },

  // Submit review (Protected)
  submit: async (data: CreateReviewRequest): Promise<Review> => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/submit`, data);
    return response.data;
  },

  // Delete review (Protected)
  delete: async (reviewId: string): Promise<void> => {
    return http.delete(`${REVIEW_BASE_URL}/${reviewId}`);
  },
};
