import axiosInstance from './http';

export const whatsappSystemService = {
  getQueueStatus: async () => {
    return axiosInstance.get('/whatsapp/system/queue-status');
  },

  retryFailedJobs: async () => {
    return axiosInstance.post('/whatsapp/system/retry-failed');
  },

  cleanQueue: async (status: string, limit?: number) => {
    return axiosInstance.post('/whatsapp/system/clean-queue', { status, limit });
  },

  clearQueue: async () => {
    return axiosInstance.post('/whatsapp/system/clear-queue');
  },
  
  pause: async () => {
    return axiosInstance.post('/whatsapp/system/pause');
  },

  resume: async () => {
    return axiosInstance.post('/whatsapp/system/resume');
  },

  resetCounters: async () => {
    return axiosInstance.post('/whatsapp/system/reset-counters');
  }
};
