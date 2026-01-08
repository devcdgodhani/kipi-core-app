import { Schema, model } from 'mongoose';
import { IPaymentGatewayDocument } from '../../../interfaces/paymentGateway';
import { PAYMENT_GATEWAY, GATEWAY_ENVIRONMENT, PAYMENT_GATEWAY_DEFAULTS } from '../../../constants/payment';

const PaymentGatewaySchema = new Schema<IPaymentGatewayDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: Object.values(PAYMENT_GATEWAY),
      index: true
    },
    displayName: {
      type: String,
      required: true
    },
    isEnabled: {
      type: Boolean,
      default: false,
      index: true
    },
    environment: {
      type: String,
      enum: Object.values(GATEWAY_ENVIRONMENT),
      default: GATEWAY_ENVIRONMENT.SANDBOX
    },
    credentials: {
      type: String,
      required: true
      // Stored as encrypted JSON string
    },
    webhookSecret: {
      type: String,
      default: ''
    },
    config: {
      callbackUrl: { type: String },
      timeout: { type: Number, default: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT },
      retryAttempts: { type: Number, default: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS }
    },
    priority: {
      type: Number,
      default: 1,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound index for enabled gateways sorted by priority
PaymentGatewaySchema.index({ isEnabled: 1, priority: 1 });

export const PaymentGatewayModel = model<IPaymentGatewayDocument>(
  'PaymentGateway',
  PaymentGatewaySchema
);
