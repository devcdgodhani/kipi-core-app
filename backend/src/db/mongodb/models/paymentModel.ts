import { Schema, model } from 'mongoose';
import { IPaymentDocument } from '../../../interfaces/payment';
import { PAYMENT_GATEWAY, PAYMENT_STATUS, PAYMENT_GATEWAY_DEFAULTS } from '../../../constants/payment';

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    gatewayName: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_GATEWAY)
    },
    gatewayTransactionId: {
      type: String,
      index: true,
      sparse: true
    },
    gatewayOrderId: {
      type: String,
      sparse: true
    },
    internalPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: PAYMENT_GATEWAY_DEFAULTS.CURRENCY
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.INITIATED
    },
    metadata: {
      paymentMethod: { type: String },
      upiId: { type: String },
      cardLast4: { type: String },
      cardNetwork: { type: String },
      bankName: { type: String },
      gatewayResponse: { type: Schema.Types.Mixed }
    },
    webhookReceivedAt: {
      type: Date
    },
    webhookProcessedAt: {
      type: Date
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      sparse: true
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    refundCount: {
      type: Number,
      default: 0,
      min: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    deletedAt: {
      type: Date,
      index: true
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ gatewayName: 1, status: 1, createdAt: -1 });

export const PaymentModel = model<IPaymentDocument>('Payment', PaymentSchema);
