import { Schema, model } from 'mongoose';
import { IFlashDealDocument } from '../../../interfaces/flashDeal';
import { FLASH_DEAL_STATUS, FLASH_DEAL_DISCOUNT_TYPE } from '../../../constants';

const flashDealSchema = new Schema<IFlashDealDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }],
    discountType: { 
      type: String, 
      enum: Object.values(FLASH_DEAL_DISCOUNT_TYPE), 
      required: true 
    },
    discountValue: { type: Number, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    maxQuantityPerUser: { type: Number },
    totalQuantityLimit: { type: Number },
    currentQuantitySold: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: Object.values(FLASH_DEAL_STATUS), 
      default: FLASH_DEAL_STATUS.SCHEDULED,
      index: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
flashDealSchema.index({ status: 1, startTime: 1, endTime: 1 });
flashDealSchema.index({ productIds: 1 });

export const FlashDealModel = model<IFlashDealDocument>('FlashDeal', flashDealSchema);
