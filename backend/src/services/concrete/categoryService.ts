import { ICategoryAttributes, ICategoryDocument } from '../../interfaces/category';
import { CategoryModel } from '../../db/mongodb/models/categoryModel';
import { MongooseCommonService } from './mongooseCommonService';
import { ICategoryService } from '../contracts/categoryServiceInterface';
import { ITreeNode } from '../../types/category';

export class CategoryService extends MongooseCommonService<ICategoryAttributes, ICategoryDocument> implements ICategoryService {
  constructor() {
    super(CategoryModel);
  }

  async getTree(filter: any): Promise<ITreeNode[]> {
    const allCategories = await this.findAll(filter, { sort: { order: 1, name: 1 } });
    return this.buildTree(allCategories);
  }

  private buildTree(nodes: ICategoryAttributes[], parentId: string | null = null): ITreeNode[] {
    const tree: ITreeNode[] = [];
    for (const node of nodes) {
      const nodeParentId = node.parentId ? node.parentId.toString() : null;
      const targetParentId = parentId ? parentId.toString() : null;

      if (nodeParentId === targetParentId) {
        const children = this.buildTree(nodes, node._id.toString());
        const treeNode: ITreeNode = { ...node };
        if (children.length > 0) {
          treeNode.children = children;
        }
        tree.push(treeNode);
      }
    }
    return tree;
  }
  softDelete = async (filter: any, options: any = {}): Promise<any> => {
    const categoriesToDelete = await this.model.find(filter).select('_id');
    const ids = categoriesToDelete.map((c) => c._id);

    if (ids.length > 0) {
      const subCategoryCount = await this.model.countDocuments({
        parentId: { $in: ids },
      });

      if (subCategoryCount > 0) {
        throw new Error(`Cannot delete category because it has active sub-categories.`);
      }
    }

    return this.model
      .updateMany(
        filter,
        { deletedBy: options.userId, deletedAt: new Date() } as any,
        options
      )
      .exec();
  };
}
