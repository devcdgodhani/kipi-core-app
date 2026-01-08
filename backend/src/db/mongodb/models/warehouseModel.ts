import { Schema, model } from 'mongoose';
import { IWarehouseDocument } from '../../../interfaces/warehouse';

const warehouseSchema = new Schema<IWarehouseDocument>(
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
// Indexes removed redundant code and isActive
warehouseSchema.index({ 'address.pincode': 1 });

export const WarehouseModel = model<IWarehouseDocument>('Warehouse', warehouseSchema);
