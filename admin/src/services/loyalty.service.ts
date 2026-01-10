import http from './http';

const LOYALTY_BASE_URL = '/loyalty';

export const loyaltyService = {
    /**
     * Get global or user-specific point ledger
     */
    getLedger: async (params?: any) => {
        const response: any = await http.post(`${LOYALTY_BASE_URL}/getWithPagination`, params);
        return response.data;
    }
};
