import { Schema, model } from 'mongoose';
import { IWhatsAppAccountDocument } from '../../../interfaces';
import { WHATSAPP_ACCOUNT_STATUS, WHATSAPP_CONNECTION_STATUS } from '../../../constants';

const whatsAppAccountSchema = new Schema<IWhatsAppAccountDocument>(
  {
    // Session Fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    externalId: {
      type: String,
      required: true,
      unique: true,
    },
    socketStatus: {
      type: String,
      enum: Object.values(WHATSAPP_CONNECTION_STATUS),
      default: WHATSAPP_CONNECTION_STATUS.DISCONNECTED,
    },
    qrCode: {
      type: String,
    },
    isAuthenticated: {
      type: Boolean,
      default: false,
    },
    isAutoResume: {
      type: Boolean,
      default: true,
    },

    // Account Fields
    number: {
      type: String,
      unique: true,
      sparse: true, // Unique but allows nulls/duplicates for null
      trim: true,
    },
    activatedAt: {
      type: Date,
    },
    numberActivatedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(WHATSAPP_ACCOUNT_STATUS),
      default: WHATSAPP_ACCOUNT_STATUS.ACTIVE,
    },
    sentToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    sentThisHour: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSentAt: {
      type: Date,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    metadata: {
      totalSent: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalFailed: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalReplies: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
whatsAppAccountSchema.index({ status: 1, riskScore: 1, sentToday: 1 });


export const WhatsAppAccountModel = model<IWhatsAppAccountDocument>(
  'WhatsAppAccount',
  whatsAppAccountSchema
);
