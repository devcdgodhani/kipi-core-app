import { Schema, model } from 'mongoose';
import { IWhatsAppMessageDocument } from '../../../interfaces';
import { WHATSAPP_MESSAGE_STATUS } from '../../../constants';

const whatsAppMessageSchema = new Schema<IWhatsAppMessageDocument>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppAccount',
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppContact',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppTemplate',
    },
    status: {
      type: String,
      enum: Object.values(WHATSAPP_MESSAGE_STATUS),
      default: WHATSAPP_MESSAGE_STATUS.QUEUED,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for queries
whatsAppMessageSchema.index({ accountId: 1, status: 1 });
whatsAppMessageSchema.index({ contactId: 1 });

whatsAppMessageSchema.index({ createdAt: -1 }); // For recent messages

export const WhatsAppMessageModel = model<IWhatsAppMessageDocument>(
  'WhatsAppMessage',
  whatsAppMessageSchema
);
