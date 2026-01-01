import { Schema, model } from 'mongoose';
import { IProductDocument } from '../../../interfaces/product';
import { PRODUCT_STATUS } from '../../../constants/product';
import { MEDIA_FILE_TYPE, MEDIA_TYPE, MEDIA_STATUS } from '../../../constants/media';


const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    
    basePrice: { type: Number, required: true },
    salePrice: { type: Number },
    offerPrice: { type: Number },
    discount: { type: Number },
    currency: { type: String, default: 'INR' },
    
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
    mainImage: { type: Schema.Types.ObjectId, ref: 'FileStorage' },
    
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
