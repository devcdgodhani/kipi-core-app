import axiosInstance from './http';

export interface IWhatsAppContact {
    _id: string;
    mobile: string;
    consent: boolean;
    state: string;
    totalReplies: number;
    lastRepliedAt?: string;
    metadata: {
        firstContactedAt: string;
        lastContactedAt?: string;
        totalMessagesSent: number;
    };
}

export const whatsappContactService = {
  getOne: async (id: string) => {
    return axiosInstance.get(`/whatsapp/contacts/${id}`);
  },

  getAll: async (filters: any = {}) => {
    return axiosInstance.post('/whatsapp/contacts/getAll', filters);
  },

  getWithPagination: async (data: any) => {
    return axiosInstance.post('/whatsapp/contacts/getWithPagination', data);
  },

  create: async (data: any) => {
    return axiosInstance.post('/whatsapp/contacts', data);
  },

  update: async (id: string, data: any) => {
    return axiosInstance.put(`/whatsapp/contacts/${id}`, data);
  },

  deleteByFilter: async (filters: any) => {
    return axiosInstance.delete('/whatsapp/contacts/deleteByFilter', { data: filters });
  },

  // Actions
  updateConsent: async (id: string, consent: boolean) => {
    return axiosInstance.put(`/whatsapp/contacts/${id}/consent`, { consent });
  },

  markAsDND: async (id: string) => {
    return axiosInstance.post(`/whatsapp/contacts/${id}/dnd`);
  }
};
