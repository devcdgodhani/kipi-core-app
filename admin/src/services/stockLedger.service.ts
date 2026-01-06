import axiosInstance from './http';

export const stockLedgerService = {
    getWithPagination: async (filters: any) => {
        const response = await axiosInstance.post('/stock-ledger/getWithPagination', filters);
        return response;
    },

    getOne: async (id: string) => {
        const response = await axiosInstance.get(`/stock-ledger/getOne/${id}`);
        return response;
    }
};
