
import http from './http';
import type { Banner, BannerFilter } from '../types/banner.types';

const BASE_URL = '/banner';

export const bannerService = {
    getActive: async (): Promise<Banner[]> => {
        const response: any = await http.get(`${BASE_URL}/getActive`);
        return response.data;
    },

    getAll: async (filter?: BannerFilter): Promise<Banner[]> => {
        const response: any = await http.post(`${BASE_URL}/getAll`, filter || {});
        return response.data;
    },

    getOne: async (filter: Partial<Banner>): Promise<Banner> => {
        const response: any = await http.post(`${BASE_URL}/getOne`, filter);
        return response.data;
    }
};
