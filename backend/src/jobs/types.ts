export interface IWebhookJobPayload {
  provider: 'SHIPROCKET';
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

export enum JOB_NAMES {
  PROCESS_WEBHOOK = 'process-webhook',
  SYNC_TRACKING = 'sync-tracking',
  SEND_NOTIFICATION = 'send-notification',
}
