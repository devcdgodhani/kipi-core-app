import http from './http';
import type { Review, UpdateReviewStatusRequest } from '../types/review';
import { REVIEW_STATUS } from '../types/review';


const REVIEW_BASE_URL = '/review';

export const reviewService = {
  // Get all reviews (with pagination and filters)
  getAll: async (params?: any) => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/getWithPagination`, params);
    return response.data;
  },

  // Get single review
  getById: async (id: string) => {
    const response: any = await http.post(`${REVIEW_BASE_URL}/getOne`, { _id: id });
    return response.data;
  },

  // Update review status (approve/reject)
  updateStatus: async (id: string, data: UpdateReviewStatusRequest) => {
    const response: any = await http.put(`${REVIEW_BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete review
  delete: async (id: string) => {
    const response: any = await http.delete(`${REVIEW_BASE_URL}/${id}`);
    return response.data;
  },

  // Bulk update status
  bulkUpdateStatus: async (ids: string[], status: string) => {
     // If backend supports bulk, use that. Otherwise loop.
     // BaseController usually supports bulkUpdate if implemented.
     const response: any = await http.post(`${REVIEW_BASE_URL}/bulkUpdate`, { ids, status });
     return response.data;
  }
};
