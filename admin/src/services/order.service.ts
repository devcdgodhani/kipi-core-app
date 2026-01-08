import http from './http';


const ORDER_BASE_URL = '/order';

export const orderService = {
  // Get paginated orders (Admin)
  getWithPagination: async (params?: any) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getWithPagination`, params);
    return response.data;
  },

  // Get all orders (Admin) - For dropdowns
  getAll: async (params?: any) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/getAll`, params);
    return response.data;
  },

  // Get single order detail
  getById: async (id: string) => {
    const response: any = await http.get(`${ORDER_BASE_URL}/${id}`);
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
  },
  
  // Simulate Logistics Update
  simulateLogistics: async (id: string) => {
    const response: any = await http.post(`${ORDER_BASE_URL}/simulate-logistics/${id}`);
    return response.data;
  },

  // Sync Payment Status
  syncPaymentStatus: async (id: string) => {
    const response: any = await http.get(`${ORDER_BASE_URL}/${id}/sync-payment`);
    return response.data;
  },
  
  // Get payments for an order
  getPayments: async (id: string) => {
    const response: any = await http.get(`${ORDER_BASE_URL}/${id}/payments`);
    return response.data;
  }
};
