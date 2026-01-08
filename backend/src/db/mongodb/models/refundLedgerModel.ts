import { Schema, model } from 'mongoose';
import { IRefundLedgerDocument } from '../../../interfaces/refundLedger';

const refundLedgerSchema = new Schema<IRefundLedgerDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    returnId: { type: Schema.Types.ObjectId, ref: 'Return' },
    rtoId: { type: Schema.Types.ObjectId, ref: 'RTO' },
    refundNumber: { type: String, required: true, unique: true },
    refundType: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    refundMethod: { type: String, required: true },
    status: { type: String, required: true, index: true },
    paymentGateway: { type: String },
    transactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      bankName: { type: String }
    },
    initiatedDate: { type: Date, required: true },
    processedDate: { type: Date },
    completedDate: { type: Date },
    failedDate: { type: Date },
    failureReason: { type: String },
    retryCount: { type: Number, default: 0 },
    breakdown: {
      itemAmount: { type: Number },
      shippingRefund: { type: Number },
      taxRefund: { type: Number },
      discountAdjustment: { type: Number },
      pointsAdjustment: { type: Number }
    },
    notes: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
// refundLedgerSchema.index({ orderId: 1 }); // Removed as defined in schema
refundLedgerSchema.index({ userId: 1, createdAt: -1 });
refundLedgerSchema.index({ status: 1, initiatedDate: -1 });
// refundLedgerSchema.index({ refundNumber: 1 }); // Removed as defined in schema

export const RefundLedgerModel = model<IRefundLedgerDocument>('RefundLedger', refundLedgerSchema);
