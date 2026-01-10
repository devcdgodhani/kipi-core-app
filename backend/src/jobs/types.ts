export interface IWebhookJobPayload {
  provider: 'SHIPROCKET';
  headers: Record<string, any>;
  body: any;
  receivedAt: string;
}

export interface IPaymentWebhookJobPayload {
  provider: 'RAZORPAY' | 'PHONEPE' | 'PAYTM';
  headers: Record<string, any>;
  body: any;
  receivedAt: string;
}

export interface ITrackingSyncJobPayload {
  shipmentId: string;
  awb: string;
  courierId: string; // or provider enum
}

export interface INotificationJobPayload {
  type: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  template: string;
  data: Record<string, any>;
}

export interface IWhatsAppJobPayload {
  accountId: string; // Selected WhatsAppAccount
  contactId: string; // Target WhatsAppContact
  message: string;
  templateId?: string; // Optional template reference
  metadata?: Record<string, any>;
}

export enum JOB_NAMES {
  PROCESS_WEBHOOK = 'process-webhook',
  SYNC_TRACKING = 'sync-tracking',
  SEND_NOTIFICATION = 'send-notification',
  PROCESS_PAYMENT_WEBHOOK = 'process-payment-webhook',
  SYNC_PAYMENT_STATUS = 'sync-payment-status',
  SEND_WHATSAPP = 'send-whatsapp',
}
