import { Schema, model, Types, Document } from 'mongoose';

export interface IRTO extends Document {
  shipmentId: Types.ObjectId;
  orderId: Types.ObjectId;
  awb: string;
  rtoInitiatedDate: Date;
  rtoDeliveredDate?: Date;
  rtoReason: string;
  rtoReasonText: string;
  status: string;
  rtoCost?: number;
  codRecovery?: number;
  qcStatus: string;
  qcDate?: Date;
  qcBy?: Types.ObjectId;
  qcNotes?: string;
  qcImages?: string[];
  restockStatus: string;
  restockDate?: Date;
  restockBy?: Types.ObjectId;
  restockNotes?: string;
  disposition: string;
  providerRTOId?: string;
  providerData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const rtoSchema = new Schema<IRTO>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    awb: { type: String, required: true, index: true },
    rtoInitiatedDate: { type: Date, required: true },
    rtoDeliveredDate: { type: Date },
    rtoReason: { type: String, required: true },
    rtoReasonText: { type: String, required: true },
    status: { type: String, required: true, index: true },
    rtoCost: { type: Number, min: 0 },
    codRecovery: { type: Number, min: 0 },
    qcStatus: { type: String, required: true },
    qcDate: { type: Date },
    qcBy: { type: Schema.Types.ObjectId, ref: 'users' },
    qcNotes: { type: String },
    qcImages: [{ type: String }],
    restockStatus: { type: String, required: true },
    restockDate: { type: Date },
    restockBy: { type: Schema.Types.ObjectId, ref: 'users' },
    restockNotes: { type: String },
    disposition: { type: String, required: true },
    providerRTOId: { type: String },
    providerData: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
rtoSchema.index({ shipmentId: 1 });
rtoSchema.index({ orderId: 1 });
rtoSchema.index({ status: 1, rtoInitiatedDate: -1 });
rtoSchema.index({ qcStatus: 1 });
rtoSchema.index({ restockStatus: 1 });

export const RTOModel = model<IRTO>('RTO', rtoSchema);
