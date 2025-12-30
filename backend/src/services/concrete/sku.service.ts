import SkuModel from '../../db/mongodb/models/skuModel';
import { ISkuAttributes, ISku } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';

export class SkuService extends MongooseCommonService<ISkuAttributes, ISku> {
  constructor() {
    super(SkuModel);
  }
}

export const skuService = new SkuService();
