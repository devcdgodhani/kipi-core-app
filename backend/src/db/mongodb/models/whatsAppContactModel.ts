import { Schema, model } from 'mongoose';
import { IWhatsAppContactDocument } from '../../../interfaces';
import { WHATSAPP_CONTACT_STATE } from '../../../constants';

const whatsAppContactSchema = new Schema<IWhatsAppContactDocument>(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    consent: {
      type: Boolean,
      default: false,
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(WHATSAPP_CONTACT_STATE),
      default: WHATSAPP_CONTACT_STATE.NEW,
    },
    lastRepliedAt: {
      type: Date,
    },
    totalReplies: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      firstContactedAt: {
        type: Date,
        required: true,
        default: () => new Date(),
      },
      lastContactedAt: {
        type: Date,
      },
      totalMessagesSent: {
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

// Indexes for filtering
whatsAppContactSchema.index({ consent: 1, state: 1 });


export const WhatsAppContactModel = model<IWhatsAppContactDocument>(
  'WhatsAppContact',
  whatsAppContactSchema
);
