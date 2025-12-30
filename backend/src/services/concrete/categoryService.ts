import CategoryModel from '../../db/mongodb/models/categoryModel';
import { ICategory, ICategoryAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import { Types } from 'mongoose';

export class CategoryService extends MongooseCommonService<ICategoryAttributes, ICategory> {
  constructor() {
    super(CategoryModel);
  }

  async getTree(): Promise<any[]> {
    const categories = await this.model.find({}).lean().exec();
    return this.buildTree(categories);
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter((cat) => {
        if (parentId === null) return !cat.parentId;
        return cat.parentId?.toString() === parentId.toString();
      })
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat._id),
      }));
  }

  async getWithAttributes(id: string): Promise<ICategory | null> {
    const doc = await this.model.findById(id).populate('attributes').exec();
    return (doc ? doc.toObject({ virtuals: true }) : null) as any;
  }

  async getAncestors(id: string): Promise<ICategory[]> {
    const category = await this.model.findById(id);
    if (!category || !category.path || category.path.length === 0) {
      return [];
    }
    return this.model.find({ _id: { $in: category.path } }).exec();
  }

  async getDescendants(id: string): Promise<ICategory[]> {
    return this.model.find({ path: id, isDeleted: false }).exec();
  }

  async move(id: string, newParentId: string | null) {
    const category = await this.model.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Prevent moving to own descendant
    if (newParentId) {
      const descendants = await this.getDescendants(id);
      if (descendants.some(d => (d._id as any).toString() === newParentId)) {
        throw new Error('Cannot move category to its own descendant');
      }
    }

    category.parentId = newParentId ? new Types.ObjectId(newParentId) : null;
    await category.save(); // This will trigger pre-save hook to recalculate path

    // Update all descendants
    const descendants = await this.getDescendants(id);
    for (const descendant of descendants) {
      await descendant.save(); // Recalculate their paths too
    }

    return category;
  }

  async getAttributes(id: string, includeInherited: boolean = false): Promise<any[]> {
    const category = await this.getWithAttributes(id);
    if (!category) {
      return [];
    }

    if (!includeInherited) {
      return category.attributes || [];
    }

    // Get all ancestor attributes
    const ancestors = await this.getAncestors(id);
    const allAttributes = new Set();

    // Add current category attributes
    if (category.attributes) {
      category.attributes.forEach(attr => allAttributes.add(attr.toString()));
    }

    // Add ancestor attributes
    for (const ancestor of ancestors) {
      const ancestorWithAttrs = await this.getWithAttributes((ancestor._id as any).toString());
      if (ancestorWithAttrs?.attributes) {
        ancestorWithAttrs.attributes.forEach(attr => allAttributes.add(attr.toString()));
      }
    }

    return Array.from(allAttributes);
  }
}

export const categoryService = new CategoryService();
