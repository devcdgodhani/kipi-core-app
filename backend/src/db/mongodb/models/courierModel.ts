import { Schema, model, Types, Document } from 'mongoose';

export interface ICourier extends Document {
  name: string;
  code: string;
  provider: string;
  isActive: boolean;
  isPrimary: boolean;
  serviceTypes: Array<{
    type: string;
    name: string;
    estimatedDays: number;
    isActive: boolean;
  }>;
  pricingConfig?: Record<string, any>;
  codCharges?: number;
  rtoCharges?: number;
  apiUrl?: string;
  apiCredentials?: string;
  webhookSecret?: string;
  avgDeliveryDays?: number;
  rtoPercentage?: number;
  onTimeDeliveryRate?: number;
  maxWeight?: number;
  maxCODAmount?: number;
  supportEmail?: string;
  supportPhone?: string;
  slaMin: number;
  slaMax: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const courierSchema = new Schema<ICourier>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    provider: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isPrimary: { type: Boolean, default: false },
    serviceTypes: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        estimatedDays: { type: Number, required: true, min: 1 },
        isActive: { type: Boolean, default: true }
      }
    ],
    pricingConfig: { type: Schema.Types.Mixed },
    codCharges: { type: Number, min: 0 },
    rtoCharges: { type: Number, min: 0 },
    apiUrl: { type: String },
    apiCredentials: { type: String },
    webhookSecret: { type: String },
    avgDeliveryDays: { type: Number, min: 0 },
    rtoPercentage: { type: Number, min: 0, max: 100 },
    onTimeDeliveryRate: { type: Number, min: 0, max: 100 },
    maxWeight: { type: Number, min: 0 },
    maxCODAmount: { type: Number, min: 0 },
    supportEmail: { type: String },
    supportPhone: { type: String },
    slaMin: { type: Number, default: 2 },
    slaMax: { type: Number, default: 6 },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
courierSchema.index({ code: 1 });
courierSchema.index({ isActive: 1 });

export const CourierModel = model<ICourier>('Courier', courierSchema);
