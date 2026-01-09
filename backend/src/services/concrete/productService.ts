import { ProductModel } from '../../db/mongodb/models/productModel';
import { IProductAttributes, IProductDocument } from '../../interfaces/product';
import { IProductService } from '../contracts/productServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { skuService } from './skuService';

export class ProductService
  extends MongooseCommonService<IProductAttributes, IProductDocument>
  implements IProductService
{
  private get skuService() { return skuService; }
 
  constructor() {
    super(ProductModel as any);
  }

  generateFilter(options: {
    filters?: Record<string, any>;
    searchFields?: (keyof IProductAttributes)[];
  }) {
    const { filters = {}, searchFields } = options;
    const { attributes, ...restFilters } = filters;

    // Default search fields for products if not specified
    const defaultSearchFields: (keyof IProductAttributes)[] = ['name', 'description', 'slug'];
    const effectiveSearchFields = searchFields || defaultSearchFields;

    // Use super for standard fields with search capability
    const result = super.generateFilter({ 
      ...options, 
      filters: restFilters,
      searchFields: effectiveSearchFields 
    });

    // Handle nested attribute filters
    if (attributes && typeof attributes === 'object') {
      const attrConditions: any[] = [];
      
      for (const [attrId, values] of Object.entries(attributes)) {
        if (Array.isArray(values) && values.length > 0) {
          attrConditions.push({
            attributes: {
              $elemMatch: {
                attributeId: attrId,
                value: { $in: values }
              }
            }
          });
        }
      }

      if (attrConditions.length > 0) {
        if (!result.filter.$and) {
          result.filter.$and = [];
        }
        // Use Type Assertion or spread carefully if TS complains
        (result.filter.$and as any[]).push(...attrConditions);
      }
    }

    return result;
  };

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
        await this.skuService.findOneAndUpdate(
          { _id } as any,
          { 
            $set: { 
              ...rest, 
              variantAttributes: normalizedAttrs, 
              updatedBy: userId 
            } 
          } as any
        );
      } else {
        // Attribute-aware Upsert: Find if a SKU with these attributes already exists for this product
        const existingSku = await this.skuService.findOne({
          productId,
          variantAttributes: {
            $size: normalizedAttrs.length,
            $all: normalizedAttrs.map((attr: any) => ({ $elemMatch: attr }))
          }
        } as any);

        if (existingSku) {
          // Update existing
          await this.skuService.findOneAndUpdate(
            { _id: (existingSku as any)._id } as any,
            { 
              $set: { 
                ...rest, 
                updatedBy: userId 
              } 
            } as any
          );
        } else {
          // Create new
          await this.skuService.create({
            ...rest,
            productId,
            variantAttributes: normalizedAttrs,
            createdBy: userId,
            updatedBy: userId
          } as any);
        }
      }
    }
    // Explicitly sync product stock after bulk SKU operations
    const SkuModelVar = (this.skuService as any).model;
    if (SkuModelVar && SkuModelVar.syncProductStock) {
      await SkuModelVar.syncProductStock(product._id);
    }
  }
}
 
export const productService = new ProductService();
