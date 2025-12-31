import ProductModel from '../../db/mongodb/models/productModel';
import SkuModel from '../../db/mongodb/models/skuModel';
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

  /**
   * Syncs SKUs for a given product. 
   * Handles creation and potentially updates if IDs are provided.
   */
  async syncSkus(product: any, skus: any[], userId: any) {
    if (!skus || !Array.isArray(skus) || skus.length === 0) return;

    const skusWithProductId = skus.map(sku => ({
      ...sku,
      productId: product._id,
      createdBy: sku._id ? undefined : userId,
      updatedBy: userId
    }));

    const newSkus = skusWithProductId.filter(s => !s._id);
    const updateSkus = skusWithProductId.filter(s => s._id);

    if (newSkus.length > 0) {
      await SkuModel.insertMany(newSkus);
    }

    if (updateSkus.length > 0) {
      for (const sku of updateSkus) {
        const { _id, ...updateData } = sku;
        await SkuModel.updateOne({ _id }, { $set: updateData });
      }
    }
  }
}
