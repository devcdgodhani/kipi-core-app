import axiosInstance from './http';

export const whatsappService = {
  getSessions: async (filters?: any) => {
    const response = await axiosInstance.post('/whatsapp/getAll', filters || {});
    return response;
  },

  getWithPagination: async (data: { page?: number; limit?: number; filters?: any; isPaginate?: boolean }) => {
    const response = await axiosInstance.post('/whatsapp/getWithPagination', data);
    return response;
  },
  
  getSession: async (id: string) => {
    const response = await axiosInstance.post('/whatsapp/getOne', { id });
    return response;
  },
  
  createSession: async (data: { name: string, isAutoResume?: boolean }) => {
    const response = await axiosInstance.post('/whatsapp/', data);
    return response;
  },
  
  updateSession: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/whatsapp/${id}`, data);
    return response;
  },
  
  deleteSession: async (id: string) => {
    const response = await axiosInstance.delete('/whatsapp/deleteByFilter', { data: { id } });
    return response;
  },
  
  initializeSession: async (id: string) => {
    const response = await axiosInstance.post('/whatsapp/initialize', { id });
    return response;
  },
  
  logoutSession: async (id: string) => {
    const response = await axiosInstance.post('/whatsapp/logout', { id });
    return response;
  },
  
  sendMessage: async (data: { sessionId: string, to: string, message: string }) => {
    const response = await axiosInstance.post('/whatsapp/send-message', data);
    return response;
  },
  
  sendBulkMessage: async (data: { sessionId: string, numbers: string[], message: string }) => {
    const response = await axiosInstance.post('/whatsapp/send-bulk-message', data);
    return response;
  }
};
