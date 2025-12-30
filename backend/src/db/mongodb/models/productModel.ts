import { Schema, model } from 'mongoose';
import { IProduct } from '../../../interfaces';
import { PRODUCT_STATUS, SOURCE_TYPE } from '../../../constants';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
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
    hasLotTracking: {
      type: Boolean,
      default: false,
    },
    brand: {
      type: String,
      trim: true,
    },
    variantAttributes: [{
      type: Schema.Types.ObjectId,
      ref: 'Attribute',
    }],
    specifications: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },
    images: [{ type: String }],
    tags: [String],
    metaData: {
      seoTitle: String,
      seoDescription: String,
      seoKeywords: [String],
    },
    mrp: {
      type: Number,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.plugin(softDeletePlugin);

// Validation: supplierId required if sourceType is SUPPLIER
productSchema.pre('save', function (this: any, next) {
  if (this.sourceType === SOURCE_TYPE.SUPPLIER && !this.supplierId) {
    next(new Error('Supplier user ID is required when source type is SUPPLIER'));
  } else {
    next();
  }
});

// Virtual for SKUs
productSchema.virtual('skus', {
  ref: 'Sku',
  localField: '_id',
  foreignField: 'product',
});

// Indexes
// productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ status: 1 });

const ProductModel = model<IProduct>('Product', productSchema);

export default ProductModel;
