import { Schema, model } from 'mongoose';
import { ISkuDocument } from '../../../interfaces/sku';
import { SKU_STATUS } from '../../../constants/sku';
import { MEDIA_FILE_TYPE, MEDIA_TYPE, MEDIA_STATUS } from '../../../constants/media';


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
    
    basePrice: { type: Number },
    salePrice: { type: Number },
    offerPrice: { type: Number },
    discount: { type: Number, default: 0 },
    
    quantity: { type: Number, default: 0 },
    media: [
      {
        fileType: { type: String, enum: Object.values(MEDIA_FILE_TYPE), default: MEDIA_FILE_TYPE.IMAGE },
        type: { type: String, default: MEDIA_TYPE.FULL },
        fileStorageId: { type: Schema.Types.ObjectId, ref: 'FileStorage' },
        url: { type: String },
        status: { type: String, enum: Object.values(MEDIA_STATUS), default: MEDIA_STATUS.ACTIVE },
        sortOrder: { type: Number, default: 0 }
      }
    ],
    
    status: { type: String, enum: Object.values(SKU_STATUS), default: SKU_STATUS.ACTIVE },
    lotId: { type: Schema.Types.ObjectId, ref: 'Lot' },

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

skuSchema.index({ productId: 1 });

skuSchema.pre('save', function (next) {
  if (this.productId === ('' as any)) {
    this.productId = null as any;
  }
  if (this.lotId === ('' as any)) {
    this.lotId = null as any;
  }
  if (this.media) {
    this.media.forEach(m => {
      if (m.fileStorageId === ('' as any)) {
        m.fileStorageId = null as any;
      }
    });
  }
  next();
});

export const SkuModel = model<ISkuDocument>('Sku', skuSchema);
