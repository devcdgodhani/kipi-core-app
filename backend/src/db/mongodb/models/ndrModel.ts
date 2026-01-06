import { Schema, model, Types, Document } from 'mongoose';

export interface INDR extends Document {
  shipmentId: Types.ObjectId;
  orderId: Types.ObjectId;
  awb: string;
  ndrDate: Date;
  ndrReason: string;
  ndrReasonText: string;
  attemptNumber: number;
  status: string;
  customerAction?: string;
  customerActionDate?: Date;
  rescheduledDate?: Date;
  rescheduledTimeSlot?: string;
  updatedAddress?: any;
  resolution?: string;
  resolvedDate?: Date;
  resolvedBy?: Types.ObjectId;
  providerNDRId?: string;
  providerData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ndrSchema = new Schema<INDR>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    awb: { type: String, required: true, index: true },
    ndrDate: { type: Date, required: true },
    ndrReason: { type: String, required: true },
    ndrReasonText: { type: String, required: true },
    attemptNumber: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, index: true },
    customerAction: { type: String },
    customerActionDate: { type: Date },
    rescheduledDate: { type: Date },
    rescheduledTimeSlot: { type: String },
    updatedAddress: { type: Schema.Types.Mixed },
    resolution: { type: String },
    resolvedDate: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'users' },
    providerNDRId: { type: String },
    providerData: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
ndrSchema.index({ shipmentId: 1, attemptNumber: 1 });
ndrSchema.index({ orderId: 1 });
ndrSchema.index({ status: 1, ndrDate: -1 });

export const NDRModel = model<INDR>('NDR', ndrSchema);
