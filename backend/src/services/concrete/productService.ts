import ProductModel from '../../db/mongodb/models/productModel';
import { IProductAttributes, IProductDocument } from '../../interfaces/product';
import { IProductService } from '../contracts/productServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class ProductService
  extends MongooseCommonService<IProductAttributes, IProductDocument>
  implements IProductService
{
  constructor() {
    super(ProductModel);
  }
}
