import { Schema, model } from 'mongoose';
import { IWhatsAppSessionDocument, WHATSAPP_SESSION_STATUS } from '../../../interfaces';
import { getTime } from 'date-fns';

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
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

whatsAppSessionSchema.pre('save', function (next) {
  const now = getTime(new Date());
  if (!this.createdAt) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});

whatsAppSessionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: getTime(new Date()) });
  next();
});

export const WhatsAppSessionModel = model<IWhatsAppSessionDocument>(
  'WhatsAppSession',
  whatsAppSessionSchema
);
