import { Schema, model } from 'mongoose';
import { IWalletRuleDocument } from '../../../interfaces/walletRule';
import { WALLET_RULE_TYPE, WALLET_RULE_VALUE_TYPE, WALLET_RULE_STATUS } from '../../../constants/walletRule';

const walletRuleSchema = new Schema<IWalletRuleDocument>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true
    },
    ruleType: { 
      type: String, 
      enum: Object.values(WALLET_RULE_TYPE), 
      required: true,
      index: true
    },
    valueType: { 
      type: String, 
      enum: Object.values(WALLET_RULE_VALUE_TYPE), 
      required: true
    },
    value: { 
      type: Number, 
      required: true,
      min: 0
    },
    minOrderAmount: { 
      type: Number,
      min: 0
    },
    maxCashbackAmount: { 
      type: Number,
      min: 0
    },
    expiryDays: { 
      type: Number,
      min: 0,
      default: 365
    },
    startDate: { 
      type: Date,
      index: true
    },
    endDate: { 
      type: Date,
      index: true
    },
    status: { 
      type: String, 
      enum: Object.values(WALLET_RULE_STATUS), 
      default: WALLET_RULE_STATUS.ACTIVE,
      required: true,
      index: true
    },
    priority: { 
      type: Number, 
      default: 0,
      index: true
    },
    metadata: { 
      type: Schema.Types.Mixed 
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for performance
walletRuleSchema.index({ ruleType: 1, status: 1, priority: -1 });
walletRuleSchema.index({ status: 1, startDate: 1, endDate: 1 });

export const WalletRuleModel = model<IWalletRuleDocument>('WalletRule', walletRuleSchema);
