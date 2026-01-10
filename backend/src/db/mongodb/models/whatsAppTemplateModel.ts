import { Schema, model } from 'mongoose';
import { IWhatsAppTemplateDocument } from '../../../interfaces';

const whatsAppTemplateSchema = new Schema<IWhatsAppTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    template: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
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

// Indexes
whatsAppTemplateSchema.index({ category: 1, isActive: 1 });

export const WhatsAppTemplateModel = model<IWhatsAppTemplateDocument>(
  'WhatsAppTemplate',
  whatsAppTemplateSchema
);
