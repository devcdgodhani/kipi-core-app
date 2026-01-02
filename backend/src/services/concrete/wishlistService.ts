import { WishlistModel } from '../../db/mongodb/models/wishlistModel';
import { IWishlistAttributes, IWishlistDocument } from '../../interfaces/wishlist';
import { IWishlistService } from '../contracts/wishlistServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class WishlistService
  extends MongooseCommonService<IWishlistAttributes, IWishlistDocument>
  implements IWishlistService
{
  constructor() {
    super(WishlistModel);
  }
}
