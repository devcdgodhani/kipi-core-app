import { Schema, model } from 'mongoose';
import { IWalletTransactionDocument } from '../../../interfaces/walletTransaction';
import { 
  WALLET_TRANSACTION_TYPE, 
  WALLET_SOURCE_TYPE, 
  WALLET_TRANSACTION_STATUS, 
  WALLET_CREATED_BY 
} from '../../../constants/walletTransaction';

const walletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    walletId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Wallet', 
      required: true, 
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', 
      required: true, 
      index: true 
    },
    transactionType: { 
      type: String, 
      enum: Object.values(WALLET_TRANSACTION_TYPE), 
      required: true,
      index: true
    },
    sourceType: { 
      type: String, 
      enum: Object.values(WALLET_SOURCE_TYPE), 
      required: true,
      index: true
    },
    sourceReferenceId: { 
      type: Schema.Types.ObjectId, 
      index: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    balanceBefore: { 
      type: Number, 
      required: true 
    },
    balanceAfter: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: Object.values(WALLET_TRANSACTION_STATUS), 
      default: WALLET_TRANSACTION_STATUS.PENDING,
      required: true,
      index: true
    },
    expiryDate: { 
      type: Date,
      index: true
    },
    metadata: { 
      type: Schema.Types.Mixed 
    },
    description: { 
      type: String, 
      required: true 
    },
    createdByType: { 
      type: String, 
      enum: Object.values(WALLET_CREATED_BY), 
      default: WALLET_CREATED_BY.SYSTEM,
      required: true 
    },
    adminUserId: { 
      type: Schema.Types.ObjectId, 
      ref: 'users' 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for performance
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ walletId: 1, status: 1 });
walletTransactionSchema.index({ sourceReferenceId: 1, sourceType: 1 });
walletTransactionSchema.index({ expiryDate: 1, status: 1 });
walletTransactionSchema.index({ status: 1, expiryDate: 1 });

export const WalletTransactionModel = model<IWalletTransactionDocument>('WalletTransaction', walletTransactionSchema);
