import http from './http';

const LOYALTY_BASE_URL = '/loyalty';

export const loyaltyService = {
    /**
     * Get user points status and history
     */
    getStatus: async (params?: any) => {
        const response: any = await http.post(`${LOYALTY_BASE_URL}/status`, params);
        return response.data;
    }
};
