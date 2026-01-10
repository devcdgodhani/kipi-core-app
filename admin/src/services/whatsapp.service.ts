import axiosInstance from './http';

export const whatsappService = {
  // Existing session management methods
  getSessions: async () => {
    const response = await axiosInstance.post('/whatsapp/getAll', {});
    return response;
  },

  getSession: async (id: string) => {
    const response = await axiosInstance.post('/whatsapp/getOne', { _id: id });
    return response;
  },

  getSessionsWithPagination: async (data: any) => {
    const response = await axiosInstance.post('/whatsapp/getWithPagination', data);
    return response;
  },

  createSession: async (data: any) => {
    const response = await axiosInstance.post('/whatsapp/accounts/create', data);
    return response;
  },

  updateAccount: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/whatsapp/accounts/${id}`, data);
    return response;
  },

  deleteSession: async (id: string) => {
    const response = await axiosInstance.delete(`/whatsapp/accounts/${id}`);
    return response;
  },

  terminateSession: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/terminate`);
    return response;
  },

  initializeSession: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/initialize`);
    return response;
  },

  logoutSession: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/logout`);
    return response;
  },

  sendMessage: async (data: any) => {
    const response = await axiosInstance.post('/whatsapp/send-message', data);
    return response;
  },

  sendBulkMessage: async (data: any) => {
    const response = await axiosInstance.post('/whatsapp/send-bulk-message', data);
    return response;
  },

  // NEW: Dashboard API methods
  getDashboardOverview: async () => {
    const response = await axiosInstance.get('/whatsapp/dashboard/overview');
    return response;
  },

  // Account Management APIs
  getAccounts: async (filters?: any) => {
    const response = await axiosInstance.post('/whatsapp/accounts/getAll', filters || {});
    return response;
  },

  getAccount: async (id: string) => {
    const response = await axiosInstance.get(`/whatsapp/accounts/${id}`);
    return response; // Interceptor already returns data
  },

  getAccountsWithPagination: async (data: { page?: number; limit?: number; filters?: any }) => {
    const response = await axiosInstance.post('/whatsapp/accounts/getWithPagination', data);
    return response;
  },

  pauseAccount: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/pause`);
    return response;
  },

  resumeAccount: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/resume`);
    return response;
  },

  forceCooldown: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/cooldown`);
    return response;
  },

  disableAccount: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/disable`);
    return response;
  },

  terminateAccount: async (id: string) => {
    const response = await axiosInstance.post(`/whatsapp/accounts/${id}/terminate`);
    return response;
  },

  deleteAccount: async (id: string) => {
    const response = await axiosInstance.delete(`/whatsapp/accounts/${id}`);
    return response;
  },

  // Queue Monitor APIs
  getQueueStatus: async () => {
    const response = await axiosInstance.get('/whatsapp/queue/status');
    return response;
  },

  retryFailedJobs: async (jobIds: string[]) => {
    const response = await axiosInstance.post('/whatsapp/queue/retry', { jobIds });
    return response;
  },

  clearFailedJobs: async () => {
    const response = await axiosInstance.post('/whatsapp/queue/clear-failed');
    return response;
  },

  // Contacts APIs
  getContacts: async (filters?: any) => {
    const response = await axiosInstance.post('/whatsapp/contacts/getAll', filters || {});
    return response;
  },

  getContactsWithPagination: async (data: { page?: number; limit?: number; filters?: any }) => {
    const response = await axiosInstance.post('/whatsapp/contacts/getWithPagination', data);
    return response;
  },

  updateConsent: async (contactId: string, consent: boolean) => {
    const response = await axiosInstance.put(`/whatsapp/contacts/${contactId}/consent`, { consent });
    return response;
  },

  markAsDND: async (contactId: string) => {
    const response = await axiosInstance.post(`/whatsapp/contacts/${contactId}/dnd`);
    return response;
  },

  // Risk Monitor APIs
  getRiskEvents: async (filters?: any) => {
    const response = await axiosInstance.post('/whatsapp/risk/events', filters || {});
    return response;
  },

  getRiskBreakdown: async () => {
    const response = await axiosInstance.get('/whatsapp/risk/breakdown');
    return response;
  },

  // System Control APIs
  pauseSystem: async () => {
    const response = await axiosInstance.post('/whatsapp/system/pause');
    return response;
  },

  resumeSystem: async () => {
    const response = await axiosInstance.post('/whatsapp/system/resume');
    return response;
  },

  resetCounters: async () => {
    const response = await axiosInstance.post('/whatsapp/system/reset-counters');
    return response;
  },
};
