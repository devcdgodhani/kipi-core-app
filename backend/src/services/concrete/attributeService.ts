import { AttributeModel } from '../../db/mongodb/models/attributeModel';
import { IAttributeAttributes, IAttributeDocument } from '../../interfaces';
import { IAttributeService } from '../contracts/attributeServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { categoryService } from './categoryService';

export class AttributeService
  extends MongooseCommonService<IAttributeAttributes, IAttributeDocument>
  implements IAttributeService
{
  private get categoryService() { return categoryService; }

  constructor() {
    super(AttributeModel as any);
  }

  softDelete = async (filter: any, options: any = {}): Promise<any> => {
    const attributesToDelete = await this.findAll(filter, { projection: { _id: 1 } });
    const ids = attributesToDelete.map((a: any) => a._id);

    if (ids.length > 0) {
      // Check usages in Categories
      const categoryUsageCount = await this.categoryService.count({
        attributeIds: { $in: ids },
      } as any);

      if (categoryUsageCount > 0) {
        throw new Error(`Cannot delete attribute because it is assigned to ${categoryUsageCount} categories.`);
      }
    }

    return this.update(
        filter,
        { deletedBy: options.userId, deletedAt: new Date() } as any,
        options
      );
  };
}

export const attributeService = new AttributeService();
