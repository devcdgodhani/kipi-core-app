import { Schema, model } from 'mongoose';
import { IRtoScoreDocument } from '../../../interfaces/rto';
import { RTO_RISK_LEVEL } from '../../../constants/rto';

const rtoScoreSchema = new Schema<IRtoScoreDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { 
      type: String, 
      enum: Object.values(RTO_RISK_LEVEL), 
      required: true 
    },
    factors: {
      customerHistory: { type: Number, default: 0 },
      pincodeRisk: { type: Number, default: 0 },
      orderValueRisk: { type: Number, default: 0 },
      accountAgeRisk: { type: Number, default: 0 }
    },
    suggestedAction: { 
      type: String, 
      enum: ['ALLOW', 'FLAG', 'BLOCK_COD'], 
      required: true 
    },
    adminAction: { type: String, enum: ['ALLOW', 'BLOCK'] },
    adminNotes: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for analytical queries
rtoScoreSchema.index({ riskScore: -1 });
rtoScoreSchema.index({ suggestedAction: 1 });

export const RtoScoreModel = model<IRtoScoreDocument>('RtoScore', rtoScoreSchema);
