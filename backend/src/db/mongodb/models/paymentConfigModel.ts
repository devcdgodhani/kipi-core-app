import { Schema, model } from 'mongoose';
import { IPaymentConfig } from '../../../interfaces';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const paymentConfigSchema = new Schema<IPaymentConfig>(
  {
    entityType: {
      type: String,
      enum: ['CATEGORY', 'PRODUCT'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'entityType',
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    prepaidEnabled: {
      type: Boolean,
      default: true,
    },
    codCharges: {
      type: {
        type: String,
        enum: ['FIXED', 'PERCENTAGE'],
      },
      value: Number,
    },
    minOrderValue: {
      type: Number,
      min: 0,
    },
    maxCodAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

paymentConfigSchema.plugin(softDeletePlugin);

// Ensure unique config per entity
paymentConfigSchema.index({ entityType: 1, entityId: 1 }, { unique: true });

const PaymentConfigModel = model<IPaymentConfig>('PaymentConfig', paymentConfigSchema);

export default PaymentConfigModel;
