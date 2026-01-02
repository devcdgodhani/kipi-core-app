import { CartModel } from '../../db/mongodb/models/cartModel';
import { ICartAttributes, ICartDocument } from '../../interfaces/cart';
import { ICartService } from '../contracts/cartServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class CartService
  extends MongooseCommonService<ICartAttributes, ICartDocument>
  implements ICartService
{
  constructor() {
    super(CartModel);
  }
}
