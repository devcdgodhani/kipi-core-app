import { Schema, model } from 'mongoose';
import { IPaymentRefundDocument } from '../../../interfaces/paymentRefund';
import { REFUND_STATUS, REFUND_REASON, PAYMENT_GATEWAY } from '../../../constants/payment';

const PaymentRefundSchema = new Schema<IPaymentRefundDocument>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      index: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true
    },
    refundNumber: {
      type: String,
      required: true,
      unique: true
    },
    gatewayName: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_GATEWAY)
    },
    gatewayRefundId: {
      type: String,
      index: true,
      sparse: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true,
      enum: Object.values(REFUND_REASON)
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.INITIATED,
      index: true
    },
    gatewayResponse: {
      type: Schema.Types.Mixed
    },
    initiatedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    processedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    failedAt: {
      type: Date
    },
    failureReason: {
      type: String
    },
    initiatedBy: {
      type: Schema.Types.Mixed,
      required: true
    },
    processedBy: {
      type: Schema.Types.Mixed
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
PaymentRefundSchema.index({ paymentId: 1, createdAt: -1 });
PaymentRefundSchema.index({ status: 1, createdAt: -1 });

export const PaymentRefundModel = model<IPaymentRefundDocument>(
  'PaymentRefund',
  PaymentRefundSchema
);
