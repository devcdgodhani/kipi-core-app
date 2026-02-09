import { Schema, model } from 'mongoose';
import { IWalletDocument } from '../../../interfaces/wallet';
import { WALLET_STATUS } from '../../../constants/wallet';

const walletSchema = new Schema<IWalletDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'users', 
      required: true, 
      unique: true
    },
    availableBalance: { 
      type: Number, 
      default: 0, 
      min: 0,
      required: true 
    },
    blockedBalance: { 
      type: Number, 
      default: 0, 
      min: 0,
      required: true 
    },
    totalEarned: { 
      type: Number, 
      default: 0, 
      min: 0,
      required: true 
    },
    totalSpent: { 
      type: Number, 
      default: 0, 
      min: 0,
      required: true 
    },
    totalExpired: { 
      type: Number, 
      default: 0, 
      min: 0,
      required: true 
    },
    lastCalculatedAt: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: Object.values(WALLET_STATUS), 
      default: WALLET_STATUS.ACTIVE,
      required: true 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for performance
walletSchema.index({ status: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ availableBalance: -1 });

export const WalletModel = model<IWalletDocument>('Wallet', walletSchema);
