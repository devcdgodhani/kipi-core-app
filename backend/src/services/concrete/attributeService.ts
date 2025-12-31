import AttributeModel from '../../db/mongodb/models/attributeModel';
import CategoryModel from '../../db/mongodb/models/categoryModel';
import { IAttributeAttributes, IAttributeDocument } from '../../interfaces';
import { IAttributeService } from '../contracts/attributeServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class AttributeService
  extends MongooseCommonService<IAttributeAttributes, IAttributeDocument>
  implements IAttributeService
{
  constructor() {
    super(AttributeModel);
  }

  softDelete = async (filter: any, options: any = {}): Promise<any> => {
    const attributesToDelete = await this.model.find(filter).select('_id');
    const ids = attributesToDelete.map((a) => a._id);

    if (ids.length > 0) {
      // Check usages in Categories
      const categoryUsageCount = await CategoryModel.countDocuments({
        attributeIds: { $in: ids },
      });

      if (categoryUsageCount > 0) {
        throw new Error(`Cannot delete attribute because it is assigned to ${categoryUsageCount} categories.`);
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
