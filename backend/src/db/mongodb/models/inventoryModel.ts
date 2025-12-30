import { Schema, model } from 'mongoose';
import { IInventory } from '../../../interfaces';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const inventorySchema = new Schema<IInventory>(
  {
    sku: {
      type: Schema.Types.ObjectId,
      ref: 'Sku',
      required: true,
      unique: true,
    },
    totalAvailableStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalReservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      min: 0,
    },
    reorderQuantity: {
      type: Number,
      min: 0,
    },
    lastRestockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.plugin(softDeletePlugin);

// Virtual for low stock check
inventorySchema.virtual('isLowStock').get(function () {
  return this.totalAvailableStock <= (this.lowStockThreshold || 0);
});

// Index for efficient queries
inventorySchema.index({ totalAvailableStock: 1 });

const InventoryModel = model<IInventory>('Inventory', inventorySchema);

export default InventoryModel;
