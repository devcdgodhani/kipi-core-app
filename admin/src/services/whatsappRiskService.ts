import axiosInstance from './http';

export interface IWhatsAppRiskEvent {
  _id: string;
  accountId: string;
  eventType: string;
  points: number;
  timestamp: string;
  metadata?: any;
}

export const whatsappRiskService = {
  getGlobalRiskAverage: async () => {
    return axiosInstance.get('/whatsapp/risk/average');
  },

  getHighRiskAccounts: async (threshold?: number) => {
    return axiosInstance.get('/whatsapp/risk/high-risk', { params: { threshold } });
  },

  getRiskBreakdown: async () => {
    return axiosInstance.get('/whatsapp/risk/breakdown');
  },

  getRecentRiskEvents: async (limit?: number) => {
    return axiosInstance.get('/whatsapp/risk/recent-events', { params: { limit } });
  },

  getAccountRiskEvents: async (accountId: string, limit?: number) => {
    return axiosInstance.get(`/whatsapp/risk/events/${accountId}`, { params: { limit } });
  },

  logRiskEvent: async (data: any) => {
    return axiosInstance.post('/whatsapp/risk/log-event', data);
  }
};
