import { Schema, model } from 'mongoose';
import { ICategory } from '../../../interfaces';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const categorySchema = new Schema<ICategory>(
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
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    path: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
    breadcrumb: [String],
    attributes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attribute',
      },
    ],
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    childrenCount: {
      type: Number,
      default: 0,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.plugin(softDeletePlugin);

// Pre-save middleware to calculate level, path, and breadcrumb
categorySchema.pre('save', async function (next) {
  if (this.isModified('parentId')) {
    if (this.parentId) {
      const parent = await model<ICategory>('Category').findById(this.parentId);
      if (parent) {
        this.level = parent.level + 1;
        this.path = [...(parent.path || []), parent._id as any];
        this.breadcrumb = [...(parent.breadcrumb || []), parent.name];
      }
    } else {
      this.level = 0;
      this.path = [];
      this.breadcrumb = [];
    }
  }
  next();
});

// Indexes
categorySchema.index({ parentId: 1 });
// categorySchema.index({ slug: 1 });
categorySchema.index({ level: 1 });

const CategoryModel = model<ICategory>('Category', categorySchema);

export default CategoryModel;
