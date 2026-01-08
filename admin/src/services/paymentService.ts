import http from './http';
import type {
  PaymentGateway,
  PaymentGatewayName,
  UpdateGatewayPayload,
  CreateGatewayPayload,
  WebhookLog,
  WebhookLogFilters,
} from '../types/payment';

const BASE_URL = '';

export const paymentService = {
  // Get all payment gateways
  getAllGateways: async (): Promise<PaymentGateway[]> => {
    // Interceptor returns response.data, so we receive the body directly
    const response: any = await http.get(`${BASE_URL}/payment-gateways`);
    return response.data || [];
  },

  // Create new gateway
  createGateway: async (payload: CreateGatewayPayload): Promise<PaymentGateway> => {
    const response = await http.post(`${BASE_URL}/payment-gateways`, payload);
    return response.data.data;
  },

  // Update gateway configuration
  updateGateway: async (
    name: PaymentGatewayName,
    payload: UpdateGatewayPayload
  ): Promise<PaymentGateway> => {
    const response = await http.put(`${BASE_URL}/payment-gateways/${name}`, payload);
    return response.data.data;
  },

  // Toggle gateway enabled status
  toggleGateway: async (name: PaymentGatewayName, isEnabled: boolean): Promise<void> => {
    await http.patch(`${BASE_URL}/payment-gateways/${name}/toggle`, { isEnabled });
  },

  // Get webhook logs
  getWebhookLogs: async (filters?: WebhookLogFilters): Promise<WebhookLog[]> => {
    const response = await http.get(`${BASE_URL}/webhooks/logs`, { params: filters });
    return response.data.data;
  },

  // Retry failed webhook
  retryWebhook: async (id: string): Promise<void> => {
    await http.post(`${BASE_URL}/webhooks/${id}/retry`);
  },
};
