import { Schema, model } from 'mongoose';
import { IWhatsAppSessionDocument } from '../../../interfaces';
import { WHATSAPP_SESSION_STATUS } from '../../../constants';

const whatsAppSessionSchema = new Schema<IWhatsAppSessionDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    externalId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(WHATSAPP_SESSION_STATUS),
      default: WHATSAPP_SESSION_STATUS.DISCONNECTED,
    },
    qrCode: {
      type: String,
    },
    isAutoResume: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const WhatsAppSessionModel = model<IWhatsAppSessionDocument>(
  'WhatsAppSession',
  whatsAppSessionSchema
);
