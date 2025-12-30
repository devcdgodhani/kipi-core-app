import { Schema, model } from 'mongoose';
import { ISku } from '../../../interfaces';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const skuSchema = new Schema<ISku>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    attributes: [
      {
        attributeId: {
          type: Schema.Types.ObjectId,
          ref: 'Attribute',
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
        attributeName: String,
      },
    ],
    barcode: {
      type: String,
      trim: true,
    },
    ean: {
      type: String,
      trim: true,
    },
    upc: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String,
    },
    manufacturingDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    images: {
      type: [String],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lotId: {
      type: Schema.Types.ObjectId,
      ref: 'Lot',
    },
  },
  {
    timestamps: true,
  }
);

skuSchema.plugin(softDeletePlugin);

// Indexes
skuSchema.index({ product: 1 });
// skuSchema.index({ sku: 1 });
skuSchema.index({ barcode: 1 });

const SkuModel = model<ISku>('Sku', skuSchema);

export default SkuModel;
