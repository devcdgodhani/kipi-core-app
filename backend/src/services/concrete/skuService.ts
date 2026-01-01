import { SkuModel } from '../../db/mongodb/models/skuModel';
import { ISkuAttributes, ISkuDocument } from '../../interfaces/sku';
import { ISkuService } from '../contracts/skuServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class SkuService
  extends MongooseCommonService<ISkuAttributes, ISkuDocument>
  implements ISkuService
{
  constructor() {
    super(SkuModel);
  }
}
