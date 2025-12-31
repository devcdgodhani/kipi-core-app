import { Schema, model } from 'mongoose';
import { IProductDocument } from '../../../interfaces/product';
import { PRODUCT_STATUS } from '../../../constants/product';

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    
    basePrice: { type: Number, required: true },
    salePrice: { type: Number },
    discount: { type: Number },
    currency: { type: String, default: 'INR' },
    
    images: [{ type: String }],
    mainImage: { type: String },
    
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    
    attributes: [
      {
        attributeId: { type: Schema.Types.ObjectId, ref: 'Attribute' },
        value: { type: Schema.Types.Mixed },
        label: { type: String }
      }
    ],
    
    status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.DRAFT },
    stock: { type: Number, default: 0 },
    
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ name: 1 });
productSchema.index({ categoryIds: 1 });

const ProductModel = model<IProductDocument>('Product', productSchema);

export default ProductModel;
