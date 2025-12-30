import AttributeModel from '../../db/mongodb/models/attributeModel';
import { IAttribute, IAttributeAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';

export class AttributeService extends MongooseCommonService<IAttributeAttributes, IAttribute> {
  constructor() {
    super(AttributeModel);
  }

  async findByCode(code: string): Promise<IAttribute | null> {
    return this.model.findOne({ code, isActive: true });
  }
}

export const attributeService = new AttributeService();
