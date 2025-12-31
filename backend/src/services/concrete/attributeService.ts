import AttributeModel from '../../db/mongodb/models/attributeModel';
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
}
