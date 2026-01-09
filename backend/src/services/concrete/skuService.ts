import { SkuModel } from '../../db/mongodb/models/skuModel';
import { ISkuAttributes, ISkuDocument } from '../../interfaces';
import { ISkuService } from '../contracts/skuServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class SkuService extends MongooseCommonService<ISkuAttributes, ISkuDocument> implements ISkuService {
  constructor() {
    super(SkuModel as any);
  }
}

export const skuService = new SkuService();
