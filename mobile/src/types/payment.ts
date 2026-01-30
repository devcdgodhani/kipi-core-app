export interface Payment {
  _id: string;
  orderId: string;
  internalPaymentId: string;
  gatewayName: string;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND';
  gatewayTransactionId?: string;
  metadata?: any;
  createdAt: string;
}

export interface Refund {
  _id: string;
  paymentId: string;
  orderId: string;
  refundNumber: string;
  amount: number;
  reason: string;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  notes?: string;
  initiatedAt: string;
  completedAt?: string;
}

export interface PaymentGatewayOption {
  name: string;
  displayName: string;
  priority: number;
}
