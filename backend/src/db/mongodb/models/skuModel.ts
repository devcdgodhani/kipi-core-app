import { Schema, model } from 'mongoose';
import { ISkuDocument } from '../../../interfaces/sku';
import { SKU_STATUS } from '../../../constants/sku';

const skuSchema = new Schema<ISkuDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    skuCode: { type: String, required: true, unique: true },
    
    variantAttributes: [
      {
        attributeId: { type: Schema.Types.ObjectId, ref: 'Attribute' },
        value: { type: Schema.Types.Mixed }
      }
    ],
    
    price: { type: Number },
    salePrice: { type: Number },
    
    quantity: { type: Number, default: 0 },
    images: [{ type: String }],
    
    status: { type: String, enum: Object.values(SKU_STATUS), default: SKU_STATUS.ACTIVE },
    lotId: { type: Schema.Types.ObjectId, ref: 'Lot' },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

skuSchema.index({ productId: 1 });

const SkuModel = model<ISkuDocument>('Sku', skuSchema);

export default SkuModel;
