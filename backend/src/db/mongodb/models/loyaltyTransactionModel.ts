import { Schema, model } from 'mongoose';
import { ILoyaltyTransactionDocument } from '../../../interfaces/loyalty';
import { LOYALTY_TRANSACTION_TYPE } from '../../../constants/loyalty';

const loyaltyTransactionSchema = new Schema<ILoyaltyTransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    type: { 
      type: String, 
      enum: Object.values(LOYALTY_TRANSACTION_TYPE), 
      required: true,
      index: true
    },
    points: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    message: { type: String, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for chronological auditing per user
loyaltyTransactionSchema.index({ userId: 1, createdAt: -1 });

export const LoyaltyTransactionModel = model<ILoyaltyTransactionDocument>('LoyaltyTransaction', loyaltyTransactionSchema);
