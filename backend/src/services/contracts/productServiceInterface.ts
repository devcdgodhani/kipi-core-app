import { IProductAttributes, IProductDocument } from '../../interfaces/product';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IProductService extends IMongooseCommonService<IProductAttributes, IProductDocument> {
  syncSkus(product: any, skus: any[], userId: any): Promise<void>;
  getRecommended(userId?: string, limit?: number): Promise<IProductAttributes[]>;
  getSimilar(productId: string, limit?: number): Promise<IProductAttributes[]>;
  getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<IProductAttributes[]>;
}
