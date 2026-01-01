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

    for (const skuData of skus) {
      const { _id, variantAttributes, ...rest } = skuData;
      const productId = product._id;

      // Prepare normalization for comparison
      const normalizedAttrs = (variantAttributes || []).map((a: any) => ({
        attributeId: typeof a.attributeId === 'object' ? a.attributeId._id.toString() : a.attributeId.toString(),
        value: a.value
      })).sort((a: any, b: any) => a.attributeId.localeCompare(b.attributeId));

      if (_id) {
        // Direct update by ID
        await SkuModel.updateOne(
          { _id },
          { 
            $set: { 
              ...rest, 
              variantAttributes: normalizedAttrs, 
              updatedBy: userId 
            } 
          }
        );
      } else {
        // Attribute-aware Upsert: Find if a SKU with these attributes already exists for this product
        const existingSku = await SkuModel.findOne({
          productId,
          variantAttributes: {
            $size: normalizedAttrs.length,
            $all: normalizedAttrs.map((attr: any) => ({ $elemMatch: attr }))
          }
        });

        if (existingSku) {
          // Update existing
          await SkuModel.updateOne(
            { _id: existingSku._id },
            { 
              $set: { 
                ...rest, 
                updatedBy: userId 
              } 
            }
          );
        } else {
          // Create new
          await SkuModel.create({
            ...rest,
            productId,
            variantAttributes: normalizedAttrs,
            createdBy: userId,
            updatedBy: userId
          });
        }
      }
    }
  }
}
