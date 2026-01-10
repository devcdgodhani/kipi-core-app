import { IBannerAttributes, IBannerDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IBannerService extends IMongooseCommonService<IBannerAttributes, IBannerDocument> {
  // Add custom methods here if needed
}
