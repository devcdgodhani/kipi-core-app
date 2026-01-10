import { BannerModel } from '../../db/mongodb';
import { IBannerAttributes, IBannerDocument } from '../../interfaces';
import { IBannerService } from '../contracts/bannerServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class BannerService
  extends MongooseCommonService<IBannerAttributes, IBannerDocument>
  implements IBannerService
{
  constructor() {
    super(BannerModel as any);
  }

  // Add custom methods here if needed
}

export const bannerService = new BannerService();
