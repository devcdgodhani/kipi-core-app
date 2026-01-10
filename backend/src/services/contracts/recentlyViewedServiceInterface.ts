import { IRecentlyViewedAttributes, IRecentlyViewedDocument } from '../../interfaces';
import { IProductAttributes } from '../../interfaces/product';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IRecentlyViewedService extends IMongooseCommonService<IRecentlyViewedAttributes, IRecentlyViewedDocument> {
  trackView(userId: string, productId: string): Promise<void>;
  getRecentlyViewed(userId: string, limit?: number): Promise<IProductAttributes[]>;
}
