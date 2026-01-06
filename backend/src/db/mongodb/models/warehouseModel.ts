import { Schema, model, Types, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    landmark?: string;
  };
  contactPerson: string;
  mobile: string;
  email: string;
  isActive: boolean;
  isPrimary: boolean;
  operatingHours?: Record<string, any>;
  serviceablePincodes?: string[];
  maxCapacity?: number;
  currentUtilization?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      pincode: { type: String, required: true },
      landmark: { type: String }
    },
    contactPerson: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isPrimary: { type: Boolean, default: false },
    operatingHours: { type: Schema.Types.Mixed },
    serviceablePincodes: [{ type: String }],
    maxCapacity: { type: Number, min: 0 },
    currentUtilization: { type: Number, min: 0, max: 100 },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ isActive: 1 });
warehouseSchema.index({ 'address.pincode': 1 });

export const WarehouseModel = model<IWarehouse>('Warehouse', warehouseSchema);
