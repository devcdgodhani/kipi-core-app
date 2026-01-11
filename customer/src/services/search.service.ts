
import http from './http';

const BASE_URL = '/search';

export const searchService = {
    getTrending: async (): Promise<string[]> => {
        const response: any = await http.get(`${BASE_URL}/trending`);
        return response.data;
    },

    getSuggestions: async (query: string): Promise<string[]> => {
        const response: any = await http.get(`${BASE_URL}/suggestions`, { params: { query } });
        return response.data;
    },

    trackSearch: async (query: string, resultCount: number): Promise<void> => {
        await http.post(`${BASE_URL}/track`, { query, resultCount });
    }
};
