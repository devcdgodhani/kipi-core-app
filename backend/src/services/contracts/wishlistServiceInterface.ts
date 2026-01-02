import { IWishlistAttributes, IWishlistDocument } from '../../interfaces/wishlist';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IWishlistService extends IMongooseCommonService<IWishlistAttributes, IWishlistDocument> {}
