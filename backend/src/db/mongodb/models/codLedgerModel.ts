import { Schema, model, Types, Document } from 'mongoose';

export interface ICODLedger extends Document {
  orderId: Types.ObjectId;
  shipmentId: Types.ObjectId;
  awb: string;
  codAmount: number;
  collectionDate?: Date;
  status: string;
  settlementBatchId?: string;
  settlementDate?: Date;
  settlementAmount?: number;
  settlementCharges?: number;
  netSettlement?: number;
  courierId: Types.ObjectId;
  courierName: string;
  remittanceId?: string;
  remittanceDate?: Date;
  remittanceMode?: string;
  utrNumber?: string;
  isReconciled: boolean;
  reconciledDate?: Date;
  reconciledBy?: Types.ObjectId;
  discrepancy?: {
    expectedAmount: number;
    receivedAmount: number;
    difference: number;
    reason?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const codLedgerSchema = new Schema<ICODLedger>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    awb: { type: String, required: true, index: true },
    codAmount: { type: Number, required: true, min: 0 },
    collectionDate: { type: Date },
    status: { type: String, required: true, index: true },
    settlementBatchId: { type: String },
    settlementDate: { type: Date },
    settlementAmount: { type: Number, min: 0 },
    settlementCharges: { type: Number, min: 0 },
    netSettlement: { type: Number },
    courierId: { type: Schema.Types.ObjectId, ref: 'Courier', required: true },
    courierName: { type: String, required: true },
    remittanceId: { type: String },
    remittanceDate: { type: Date },
    remittanceMode: { type: String },
    utrNumber: { type: String },
    isReconciled: { type: Boolean, default: false, index: true },
    reconciledDate: { type: Date },
    reconciledBy: { type: Schema.Types.ObjectId, ref: 'users' },
    discrepancy: {
      expectedAmount: { type: Number },
      receivedAmount: { type: Number },
      difference: { type: Number },
      reason: { type: String }
    },
    notes: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
codLedgerSchema.index({ orderId: 1 });
codLedgerSchema.index({ shipmentId: 1 });
codLedgerSchema.index({ status: 1, collectionDate: -1 });
codLedgerSchema.index({ isReconciled: 1, settlementDate: -1 });
codLedgerSchema.index({ courierId: 1, settlementDate: -1 });

export const CODLedgerModel = model<ICODLedger>('CODLedger', codLedgerSchema);
