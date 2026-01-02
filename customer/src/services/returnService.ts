import http from './http';

const RETURN_BASE_URL = '/return';

export const returnService = {
  // Create return request (Customer)
  requestReturn: async (data: any) => {
    const response: any = await http.post(`${RETURN_BASE_URL}/request`, data);
    return response.data;
  },

  // Get my returns
  getMyReturns: async (filters?: any) => {
    const response: any = await http.post(`${RETURN_BASE_URL}/getMyReturns`, filters);
    return response.data;
  },

  // Get specific return detail
  getOne: async (id: string) => {
    const response: any = await http.get(`${RETURN_BASE_URL}/getOne/${id}`);
    return response.data;
  }
};
