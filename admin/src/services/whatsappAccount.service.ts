import axiosInstance from './http';

// Types should be imported from a shared internal types file or redefined
export interface IWhatsAppAccount {
    _id: string;
    name: string;
    number?: string;
    status: string;
    socketStatus: string;
    isAutoResume?: boolean;
    riskScore?: number;
    numberActivatedAt?: string;
    activatedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    sentToday?: number;
    qrCode?: string;
    metadata?: {
        totalSent?: number;
        [key: string]: any;
    };
}

export const whatsappAccountService = {
  getOne: async (id: string) => {
    return axiosInstance.get(`/whatsapp/accounts/${id}`);
  },

  getAll: async (filters: any = {}) => {
    return axiosInstance.post('/whatsapp/accounts/getAll', filters);
  },

  getWithPagination: async (data: any) => {
    return axiosInstance.post('/whatsapp/accounts/getWithPagination', data);
  },

  create: async (data: any) => {
    return axiosInstance.post('/whatsapp/accounts', data);
  },

  update: async (id: string, data: any) => {
    return axiosInstance.put(`/whatsapp/accounts/${id}`, data);
  },

  deleteByFilter: async (filters: any) => {
    return axiosInstance.delete('/whatsapp/accounts/deleteByFilter', { data: filters });
  },

  // Actions
  initialize: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/initialize`);
  },
  
  logout: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/logout`);
  },
  
  terminate: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/terminate`);
  },

  pause: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/pause`);
  },

  resume: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/resume`);
  },

  disable: async (id: string) => {
    return axiosInstance.post(`/whatsapp/accounts/${id}/disable`);
  },

  // Missing convenience methods
  delete: async (id: string) => {
      // Backend expects deleteByFilter usually, but let's see if we added deleteById route?
      // Route has: router.delete('/deleteByFilter', ...);
      // We can use deleteByFilter with ID.
      return axiosInstance.delete('/whatsapp/accounts/deleteByFilter', { data: { _id: id } });
  },

  forceCooldown: async (_id: string) => {
      // Not implemented in backend yet - would need to add route/controller method
      throw new Error("Force cooldown not implemented"); 
  },

  sendMessage: async (id: string, data: { to: string; message: string; templateId?: string }) => {
      return axiosInstance.post(`/whatsapp/accounts/${id}/send`, data);
  },

  sendBulkMessage: async (data: { recipients: any[]; templateId?: string }) => {
      return axiosInstance.post('/whatsapp/accounts/send-bulk', data);
  }
};
