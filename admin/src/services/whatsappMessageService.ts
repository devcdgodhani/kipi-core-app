import axiosInstance from './http';

export interface IWhatsAppMessage {
    _id: string;
    accountId: string;
    contactId: string;
    message: string;
    status: string;
    jobId: string;
    templateId?: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    failureReason?: string;
}

export const whatsappMessageService = {
  getOne: async (id: string) => {
    return axiosInstance.get(`/whatsapp/messages/${id}`);
  },

  getAll: async (filters: any = {}) => {
    return axiosInstance.post('/whatsapp/messages/getAll', filters);
  },

  getWithPagination: async (data: any) => {
    return axiosInstance.post('/whatsapp/messages/getWithPagination', data);
  },

  create: async (data: any) => {
    return axiosInstance.post('/whatsapp/messages', data);
  },

  update: async (id: string, data: any) => {
    return axiosInstance.put(`/whatsapp/messages/${id}`, data);
  },

  deleteByFilter: async (filters: any) => {
    return axiosInstance.delete('/whatsapp/messages/deleteByFilter', { data: filters });
  }
};
