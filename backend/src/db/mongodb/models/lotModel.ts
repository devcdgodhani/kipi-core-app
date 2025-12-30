import { Schema, model } from 'mongoose';
import { ILot } from '../../../interfaces';
import { SOURCE_TYPE } from '../../../constants';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const lotSchema = new Schema<ILot>(
  {
    lotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    sourceType: {
      type: String,
      enum: Object.values(SOURCE_TYPE),
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    manufacturingDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    costPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    initialQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchaseOrderReference: {
      type: String,
      trim: true,
    },
    qualityCheckStatus: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure currentQuantity is set if not provided
lotSchema.pre('save', function (next) {
  if (this.isNew && (this.currentQuantity === undefined || this.currentQuantity === null)) {
    this.currentQuantity = this.initialQuantity;
  }
  next();
});

lotSchema.plugin(softDeletePlugin);

// Index for efficient queries
lotSchema.index({ expiryDate: 1 });

const LotModel = model<ILot>('Lot', lotSchema);

export default LotModel;
