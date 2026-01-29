import { Schema, model } from 'mongoose';
import { ICustomerAppSettingsDocument } from '../../../interfaces/customerAppSettings';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../../../constants/customerAppSettings';

const sectionSchema = new Schema({
  sectionId: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  displayOrder: { type: Number, required: true },
  title: { type: String },
  subtitle: { type: String },
  viewAllLink: { type: String },
  viewAllText: { type: String },
  limit: { type: Number },
}, { _id: false });

const featureSchema = new Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, required: true },
}, { _id: false });

const footerSchema = new Schema({
  brand: {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
  },
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  }],
  columns: [{
    title: { type: String, required: true },
    links: [{
      label: { type: String, required: true },
      url: { type: String, required: true },
      isActive: { type: Boolean, default: true },
    }],
    displayOrder: { type: Number, required: true },
  }],
  contact: {
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  copyright: { type: String, required: true },
  language: { type: String, default: 'English (US)' },
  currency: { type: String, default: 'USD ($)' },
}, { _id: false });

const customerAppSettingsSchema = new Schema<ICustomerAppSettingsDocument>(
  {
    sections: {
      type: [sectionSchema],
      required: true,
    },
    features: {
      type: [featureSchema],
      required: true,
    },
    footer: {
      type: footerSchema,
      required: true,
    },
    logo: {
      type: Schema.Types.ObjectId,
      ref: 'FileStorage',
    },
    appName: {
      type: String,
      required: true,
      default: 'Kipi',
    },
    favicon: {
      type: Schema.Types.ObjectId,
      ref: 'FileStorage',
    },
    status: { 
      type: String, 
      enum: Object.values(CUSTOMER_APP_SETTINGS_STATUS), 
      default: CUSTOMER_APP_SETTINGS_STATUS.ACTIVE 
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
customerAppSettingsSchema.index({ status: 1, isDefault: 1 });
customerAppSettingsSchema.index({ isDefault: 1 });

// Ensure only one default settings document
customerAppSettingsSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.model('CustomerAppSettings').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export const CustomerAppSettingsModel = model<ICustomerAppSettingsDocument>(
  'CustomerAppSettings', 
  customerAppSettingsSchema
);
