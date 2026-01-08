export type PaymentGatewayName = 'PHONEPE' | 'RAZORPAY' | 'PAYTM';
export type PaymentGatewayEnvironment = 'sandbox' | 'production';
export type WebhookLogStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface PaymentGateway {
  _id: string;
  name: PaymentGatewayName;
  displayName: string;
  isEnabled: boolean;
  environment: PaymentGatewayEnvironment;
  priority: number;
  credentials: string | Record<string, any>; // Encrypted string in DB, Object in Admin API
  webhookSecret: string;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  _id: string;
  eventId: string;
  provider: string;
  eventType: string;
  status: WebhookLogStatus;
  payload: any;
  headers: Record<string, string>;
  processedAt?: string;
  processingTime?: number;
  error?: string;
  errorStack?: string;
  retryCount: number;
  createdAt: string;
}

export interface UpdateGatewayPayload {
  displayName?: string;
  isEnabled?: boolean;
  environment?: PaymentGatewayEnvironment;
  credentials?: string | Record<string, any>;
  webhookSecret?: string;
  priority?: number;
  config?: Record<string, any>;
}

export interface CreateGatewayPayload extends UpdateGatewayPayload {
  name: PaymentGatewayName;
}

export interface WebhookLogFilters {
  provider?: string;
  status?: string;
  eventType?: string;
  limit?: number;
  skip?: number;
}
