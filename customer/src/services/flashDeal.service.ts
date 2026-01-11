
import http from './http';
import type { FlashDeal } from '../types/flashDeal.types';

const BASE_URL = '/flash-deal';

export const flashDealService = {
    getActive: async (): Promise<FlashDeal[]> => {
        const response: any = await http.get(`${BASE_URL}/getActive`);
        return response.data;
    }
};
