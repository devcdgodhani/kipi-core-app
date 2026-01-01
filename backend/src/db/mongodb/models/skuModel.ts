import mongoose, { Schema, model } from 'mongoose';
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

// Stock Synchronization Utility
const syncProductStock = async (productId: any) => {
  if (!productId) return;
  try {
    const Product = model('Product');
    const Sku = model('Sku');

    const stats = await Sku.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId.toString()) } },
      { $group: { _id: '$productId', totalStock: { $sum: '$quantity' } } }
    ]);

    const totalStock = stats.length > 0 ? stats[0].totalStock : 0;
    await Product.updateOne({ _id: productId }, { stock: totalStock });
  } catch (err) {
    console.error('Failed to sync product stock:', err);
  }
};

skuSchema.statics.syncProductStock = syncProductStock;

skuSchema.post('save', async function (doc: any) {
  await syncProductStock(doc.productId);
});

skuSchema.post('updateOne', async function (this: any) {
  const filter = this.getFilter();
  const skus = await model('Sku').find(filter).select('productId').lean();
  const productIds = [...new Set(skus.map((s: any) => s.productId?.toString()))].filter(Boolean);
  for (const pid of productIds) {
    await syncProductStock(pid);
  }
});

skuSchema.post('updateMany', async function (this: any) {
  const filter = this.getFilter();
  const skus = await model('Sku').find(filter).select('productId').lean();
  const productIds = [...new Set(skus.map((s: any) => s.productId?.toString()))].filter(Boolean);
  for (const pid of productIds) {
    await syncProductStock(pid);
  }
});

skuSchema.post('findOneAndUpdate', async function (this: any) {
  const filter = this.getFilter();
  const skus = await model('Sku').find(filter).select('productId').lean();
  const productIds = [...new Set(skus.map((s: any) => s.productId?.toString()))].filter(Boolean);
  for (const pid of productIds) {
    await syncProductStock(pid);
  }
});

export const SkuModel = model<ISkuDocument>('Sku', skuSchema);
