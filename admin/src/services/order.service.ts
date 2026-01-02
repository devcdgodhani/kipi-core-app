import http from './http';


const ORDER_BASE_URL = '/order';

export const orderService = {
  // Get all orders (Admin) - Paginated
  getAll: async (params?: any) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getAll`, params);
    return response.data;
  },

  // Get single order detail
  getById: async (id: string) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getOne/${id}`);
    return response.data;
  },

  // Update order status (Admin)
  updateStatus: async (id: string, orderStatus: string) => {
    const response: any = await http.put(`${ORDER_BASE_URL}/updateStatus/${id}`, { orderStatus });
    return response.data;
  },

  // Delete order (if required, currently using base if available)
  delete: async (id: string) => {
    const response: any = await http.delete(`${ORDER_BASE_URL}/${id}`);
    return response.data;
  }
};
