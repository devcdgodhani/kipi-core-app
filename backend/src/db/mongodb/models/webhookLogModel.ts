import { Schema, model } from 'mongoose';
import { IWebhookLogDocument } from '../../../interfaces/webhookLog';

const webhookLogSchema = new Schema<IWebhookLogDocument>(
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

export const WebhookLogModel = model<IWebhookLogDocument>('WebhookLog', webhookLogSchema);
