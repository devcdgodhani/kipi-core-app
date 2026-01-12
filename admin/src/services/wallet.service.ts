import http from './http';

const WALLET_BASE_URL = '/wallet';
const TRANSACTION_BASE_URL = '/wallet-transaction';
const RULE_BASE_URL = '/wallet-rule';

export const walletService = {
    // --- Wallet Management ---
    getWalletByUserId: async (userId: string) => {
        const response: any = await http.get(`${WALLET_BASE_URL}/user/${userId}`);
        return response.data;
    },

    getAllWallets: async (params?: any) => {
        const response: any = await http.post(`${WALLET_BASE_URL}/getWithPagination`, params);
        return response.data;
    },

    manualCredit: async (data: { userId: string; amount: number; description: string }) => {
        const response: any = await http.post(`${WALLET_BASE_URL}/manual-credit`, data);
        return response.data;
    },

    manualDebit: async (data: { userId: string; amount: number; description: string }) => {
        const response: any = await http.post(`${WALLET_BASE_URL}/manual-debit`, data);
        return response.data;
    },

    blockWallet: async (walletId: string, reason?: string) => {
        const response: any = await http.patch(`${WALLET_BASE_URL}/block/${walletId}`, { reason });
        return response.data;
    },

    unblockWallet: async (walletId: string) => {
        const response: any = await http.patch(`${WALLET_BASE_URL}/unblock/${walletId}`);
        return response.data;
    },

    recalculateBalance: async (walletId: string) => {
        const response: any = await http.post(`${WALLET_BASE_URL}/recalculate/${walletId}`);
        return response.data;
    },

    // --- Transaction Management ---
    getTransactions: async (params?: any) => {
        const response: any = await http.post(`${TRANSACTION_BASE_URL}/getWithPagination`, params);
        return response.data;
    },

    confirmTransaction: async (transactionId: string) => {
        const response: any = await http.post(`${TRANSACTION_BASE_URL}/confirm/${transactionId}`);
        return response.data;
    },

    reverseTransaction: async (transactionId: string, reason: string) => {
        const response: any = await http.post(`${TRANSACTION_BASE_URL}/reverse/${transactionId}`, { reason });
        return response.data;
    },

    expireTransaction: async (transactionId: string) => {
        const response: any = await http.post(`${TRANSACTION_BASE_URL}/expire/${transactionId}`);
        return response.data;
    },

    // --- Rule Management ---
    getRules: async (params?: any) => {
        const response: any = await http.post(`${RULE_BASE_URL}/getWithPagination`, params);
        return response.data;
    },

    getRuleById: async (id: string) => {
        const response: any = await http.get(`${RULE_BASE_URL}/getOne/${id}`);
        return response.data;
    },

    createRule: async (data: any) => {
        const response: any = await http.post(`${RULE_BASE_URL}`, data);
        return response.data;
    },

    updateRule: async (id: string, data: any) => {
        const response: any = await http.put(`${RULE_BASE_URL}/${id}`, data);
        return response.data;
    },

    deleteRule: async (params: any) => {
        const response: any = await http.delete(`${RULE_BASE_URL}/deleteByFilter`, { data: params });
        return response.data;
    },

    activateRule: async (ruleId: string) => {
        const response: any = await http.patch(`${RULE_BASE_URL}/activate/${ruleId}`);
        return response.data;
    },

    deactivateRule: async (ruleId: string) => {
        const response: any = await http.patch(`${RULE_BASE_URL}/deactivate/${ruleId}`);
        return response.data;
    }
};
