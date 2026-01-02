import http from './http';
import type { Review, CreateReviewRequest, UpdateReviewRequest } from '../types/review.types';

const REVIEW_BASE_URL = '/review';

export const reviewService = {
  // Get reviews for a product
  getByProduct: async (productId: string): Promise<Review[]> => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/getAll`, { 
      productId, 
      status: 'APPROVED', 
      isVisible: true 
    });
    return response.data;
  },

  // Get user's reviews
  getByUser: async (userId: string): Promise<Review[]> => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/getAll`, { userId });
    return response.data;
  },

  // Create review
  create: async (data: CreateReviewRequest): Promise<Review> => {
    const response: any = await http.post(REVIEW_BASE_URL, data);
    return response.data;
  },

  // Update review
  update: async (reviewId: string, data: UpdateReviewRequest): Promise<void> => {
    return http.put(`${REVIEW_BASE_URL}/${reviewId}`, data);
  },

  // Delete review
  delete: async (reviewId: string): Promise<void> => {
    return http.delete(`${REVIEW_BASE_URL}/deleteByFilter`, { data: { _id: reviewId } });
  },
};
