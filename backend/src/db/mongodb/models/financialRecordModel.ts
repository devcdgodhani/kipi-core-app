import { Schema, model } from 'mongoose';
import { IFinancialRecordDocument } from '../../../interfaces/financialRecord';
import { FINANCIAL_RECORD_STATUS, TRANSACTION_TYPE, ECOMMERCE_PLATFORM } from '../../../constants/financialRecord';

const financialRecordSchema = new Schema<IFinancialRecordDocument>(
  {
    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
      index: true
    },
    subtype: {
      type: String,
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    isAutomatic: {
      type: Boolean,
      default: false
    },
    platform: {
      type: String,
      enum: Object.values(ECOMMERCE_PLATFORM)
    },
    bankName: {
      type: String
    },
    accountNumber: {
      type: String
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    lotId: {
      type: Schema.Types.ObjectId,
      ref: 'Lot'
    },
    returnId: {
      type: Schema.Types.ObjectId,
      ref: 'Return'
    },
    walletTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'WalletTransaction'
    },
    notes: {
      type: String
    },
    status: {
      type: String,
      enum: Object.values(FINANCIAL_RECORD_STATUS),
      default: FINANCIAL_RECORD_STATUS.ACTIVE,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for efficient queries
financialRecordSchema.index({ transactionType: 1, startDate: -1 });
financialRecordSchema.index({ startDate: 1, endDate: 1 });
financialRecordSchema.index({ status: 1, createdAt: -1 });
financialRecordSchema.index({ isAutomatic: 1, transactionType: 1 });

export const FinancialRecordModel = model<IFinancialRecordDocument>('FinancialRecord', financialRecordSchema);
