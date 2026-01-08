import { Document } from 'mongoose';

export interface IWebhookLogAttributes {
  eventId: string;
  provider: string;
  eventType: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  status: string;
  processedAt?: Date;
  processingTime?: number;
  error?: string;
  errorStack?: string;
  retryCount: number;
  createdAt?: Date;
}

export interface IWebhookLogDocument extends IWebhookLogAttributes, Document {}
