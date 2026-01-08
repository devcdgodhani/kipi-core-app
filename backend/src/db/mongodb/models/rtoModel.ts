import { Schema, model } from 'mongoose';
import { IRtoDocument } from '../../../interfaces/rto';

const rtoSchema = new Schema<IRtoDocument>(
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
// rtoSchema.index({ shipmentId: 1 }); // Removed as defined in schema
// rtoSchema.index({ orderId: 1 }); // Removed as defined in schema
rtoSchema.index({ status: 1, rtoInitiatedDate: -1 });
rtoSchema.index({ qcStatus: 1 });
rtoSchema.index({ restockStatus: 1 });

export const RTOModel = model<IRtoDocument>('RTO', rtoSchema);
