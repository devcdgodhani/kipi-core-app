
import http from './http';
import type { RecentlyViewedResponse } from '../types/recentlyViewed.types';

const BASE_URL = '/recently-viewed';

export const recentlyViewedService = {
    trackView: async (productId: string): Promise<void> => {
        await http.post(`${BASE_URL}/trackView`, { productId });
    },

    getRecentlyViewed: async (limit?: number): Promise<RecentlyViewedResponse> => {
        const response: any = await http.get(`${BASE_URL}/getRecentlyViewed`, { params: { limit } });
        return { products: response.data };
    }
};
