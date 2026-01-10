import { Schema, model } from 'mongoose';
import { IWhatsAppRiskEventDocument } from '../../../interfaces';
import { WHATSAPP_RISK_EVENT_TYPE } from '../../../constants';

const whatsAppRiskEventSchema = new Schema<IWhatsAppRiskEventDocument>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppAccount',
      required: true,
    },
    eventType: {
      type: String,
      enum: Object.values(WHATSAPP_RISK_EVENT_TYPE),
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for risk monitoring
whatsAppRiskEventSchema.index({ accountId: 1, timestamp: -1 });
whatsAppRiskEventSchema.index({ eventType: 1 });

export const WhatsAppRiskEventModel = model<IWhatsAppRiskEventDocument>(
  'WhatsAppRiskEvent',
  whatsAppRiskEventSchema
);
