import SkuModel from '../../db/mongodb/models/skuModel';
import { ISku, ISkuAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';

export class SkuService extends MongooseCommonService<ISkuAttributes, ISku> {
  constructor() {
    super(SkuModel);
  }

  async findBySku(sku: string): Promise<ISku | null> {
    return this.model.findOne({ sku, isDeleted: false }).exec();
  }
}

export const skuService = new SkuService();
