import { Schema, model } from 'mongoose';
import { ICategoryDocument } from '../../../interfaces/category';
import { CATEGORY_STATUS } from '../../../constants';

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    description: { type: String },
    image: { type: Schema.Types.ObjectId, ref: 'FileStorage' },
    status: { type: String, enum: Object.values(CATEGORY_STATUS), default: CATEGORY_STATUS.ACTIVE },
    order: { type: Number, default: 0 },
    attributeIds: [{ type: Schema.Types.ObjectId, ref: 'Attribute' }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for tree and search
categorySchema.index({ parentId: 1, name: 1 });

export const CategoryModel = model<ICategoryDocument>('Category', categorySchema);
