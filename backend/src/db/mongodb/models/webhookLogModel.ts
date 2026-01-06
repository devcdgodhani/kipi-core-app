import { Schema, model, Document } from 'mongoose';

export interface IWebhookLog extends Document {
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
  createdAt: Date;
}

const webhookLogSchema = new Schema<IWebhookLog>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    headers: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, index: true },
    processedAt: { type: Date },
    processingTime: { type: Number },
    error: { type: String },
    errorStack: { type: String },
    retryCount: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

// Indexes
webhookLogSchema.index({ provider: 1, createdAt: -1 });
webhookLogSchema.index({ status: 1, createdAt: -1 });
webhookLogSchema.index({ eventType: 1, createdAt: -1 });

export const WebhookLogModel = model<IWebhookLog>('WebhookLog', webhookLogSchema);
