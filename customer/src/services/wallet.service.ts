import http from './http';

const WALLET_BASE_URL = '/wallet';
const TRANSACTION_BASE_URL = '/wallet-transaction';

export const walletService = {
    getMyWallet: async () => {
        const response: any = await http.post(`${WALLET_BASE_URL}/my-wallet`);
        return response.data;
    },

    getMyTransactions: async (params?: any) => {
        const response: any = await http.post(`${TRANSACTION_BASE_URL}/getWithPagination`, params);
        return response.data;
    },

    getExpiringTransactions: async (days: number = 7) => {
        const response: any = await http.get(`${TRANSACTION_BASE_URL}/expiring`, { params: { days } });
        return response.data;
    }
};
