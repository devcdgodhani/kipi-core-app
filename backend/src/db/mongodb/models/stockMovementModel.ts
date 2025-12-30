import { Schema, model } from 'mongoose';
import { IStockMovement } from '../../../interfaces';
import { STOCK_MOVEMENT_TYPE } from '../../../constants';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const stockMovementSchema = new Schema<IStockMovement>(
  {
    movementType: {
      type: String,
      enum: Object.values(STOCK_MOVEMENT_TYPE),
      required: true,
    },
    sku: {
      type: Schema.Types.ObjectId,
      ref: 'Sku',
      required: true,
    },
    lot: {
      type: Schema.Types.ObjectId,
      ref: 'Lot',
    },
    quantity: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.plugin(softDeletePlugin);

// Index for efficient queries
stockMovementSchema.index({ sku: 1, createdAt: -1 });
stockMovementSchema.index({ lot: 1, createdAt: -1 });
stockMovementSchema.index({ movementType: 1 });

const StockMovementModel = model<IStockMovement>('StockMovement', stockMovementSchema);

export default StockMovementModel;
