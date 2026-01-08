import http from './http';
import type { Payment, Refund, PaymentGatewayOption } from '../types/payment';

const BASE_URL = '/payment';
const GATEWAY_URL = '/payment-gateways';
const REFUND_URL = '/refund';

export const paymentService = {
  // Get enabled payment gateways
  getEnabledGateways: async (): Promise<PaymentGatewayOption[]> => {
    const response = await http.get(`${GATEWAY_URL}/enabled`);
    return response.data;
  },

  // Initiate payment
  initiatePayment: async (orderId: string, gatewayName: string): Promise<any> => {
    const response = await http.post(`${BASE_URL}/initiate`, { orderId, gatewayName });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentId: string, gatewayData: any): Promise<any> => {
    const response = await http.post(`${BASE_URL}/verify`, { paymentId, ...gatewayData });
    return response.data;
  },

  // Get my payments
  getMyPayments: async (limit = 10, skip = 0): Promise<Payment[]> => {
    const response = await http.get(`${BASE_URL}/my`, { params: { limit, skip } });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await http.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Initiate refund
  initiateRefund: async (paymentId: string, amount: number, reason: string, notes?: string): Promise<Refund> => {
    const response = await http.post(`${REFUND_URL}/initiate`, { paymentId, amount, reason, notes });
    return response.data;
  },

  // Get my refunds
  getMyRefunds: async (limit = 10, skip = 0): Promise<Refund[]> => {
    const response = await http.get(`${REFUND_URL}/my`, { params: { limit, skip } });
    return response.data;
  }
};
