import { PAYMENT_GATEWAY, REFUND_REASON } from '../constants/payment';

// Gateway credentials types
export interface IPhonePeCredentials {
  merchantId: string;
  saltKey: string;
  saltIndex: number;
}

export interface IRazorpayCredentials {
  keyId: string;
  keySecret: string;
}

export interface IPaytmCredentials {
  merchantId: string;
  merchantKey: string;
  website: string;
}

// Request/Response types for Payment APIs
export type TPaymentInitiateReq = {
  orderId: string;
  gatewayName: PAYMENT_GATEWAY;
};

export type TPaymentInitiateRes = {
  status: number;
  code: string;
  message: string;
  data?: {
    paymentId: string;
    redirectUrl?: string;
    redirectMethod?: 'GET' | 'POST';
    // Razorpay specific
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string;
  };
};

export type TPaymentVerifyReq = {
  paymentId: string;
  gatewayData: Record<string, any>;
};

export type TPaymentVerifyRes = {
  status: number;
  code: string;
  message: string;
  data?: {
    paymentId: string;
    orderId: string;
    status: string;
    amount: number;
  };
};

export type TRefundInitiateReq = {
  paymentId: string;
  amount: number;
  reason: REFUND_REASON;
  notes?: string;
};

export type TRefundInitiateRes = {
  status: number;
  code: string;
  message: string;
  data?: any;
};

export type TPaymentListRes = {
  status: number;
  code: string;
  message: string;
  data: {
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasPreviousPage: boolean;
    currentPage: number;
    hasNextPage: boolean;
    recordList: any[];
  };
};
