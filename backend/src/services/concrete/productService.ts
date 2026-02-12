import { Types, isValidObjectId } from 'mongoose';
import { ProductModel } from '../../db/mongodb/models/productModel';
import { IProductAttributes, IProductDocument } from '../../interfaces/product';
import { IProductService } from '../contracts/productServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { skuService } from './skuService';
import { generateSlug, generateNextCode } from '../../helpers/utils';

export class ProductService
  extends MongooseCommonService<IProductAttributes, IProductDocument>
  implements IProductService
{
  private get skuService() { return skuService; }
 
  constructor() {
    super(ProductModel as any);
  }

  async create(data: any, options?: any) {
    // Auto-generate Product Code if missing
    if (!data.productCode) {
      const lastProduct = await ProductModel.findOne({}, {}, { sort: { createdAt: -1 } });
      data.productCode = generateNextCode(lastProduct ? lastProduct.productCode : null, 'P-');
    }

    // Auto-generate Slug if missing
    if (!data.slug && data.name) {
      data.slug = generateSlug(data.name);
      
      // Ensure slug uniqueness
      let slugExists = await ProductModel.findOne({ slug: data.slug });
      let counter = 1;
      while (slugExists) {
        data.slug = `${generateSlug(data.name)}-${counter}`;
        slugExists = await ProductModel.findOne({ slug: data.slug });
        counter++;
      }
    }

    return super.create(data, options);
  }

  generateFilter(options: {
    filters?: Record<string, any>;
    searchFields?: (keyof IProductAttributes)[];
  }) {
    const { filters = {}, searchFields } = options;
    const { attributes, minPrice, maxPrice, inStock, categoryIds, status, ...restFilters } = filters;

    // Default search fields for products if not specified
    const defaultSearchFields: (keyof IProductAttributes)[] = ['name', 'description', 'slug', 'productCode'];
    const effectiveSearchFields = searchFields || defaultSearchFields;

    // Use super for standard fields with search capability
    const result = super.generateFilter({ 
      ...options, 
      filters: restFilters,
      searchFields: effectiveSearchFields 
    });

    // Handle Category Filter (ensure ObjectIds)
    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      result.filter.categoryIds = { 
        $in: ids.filter(id => id).map(id => isValidObjectId(id) ? new Types.ObjectId(id) : id) 
      };
    }

    // Handle Status (Exact match instead of regex)
    if (status) {
      if (Array.isArray(status)) {
        result.filter.status = { $in: status };
      } else {
        result.filter.status = status;
      }
    }

    // Handle Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
      result.filter.basePrice = priceFilter;
    }

    // Handle Availability (Stock)
    if (inStock === true || inStock === 'true') {
      result.filter.stock = { $gt: 0 };
    }

    // Handle nested attribute filters
    if (attributes && typeof attributes === 'object') {
      const attrConditions: any[] = [];
      
      for (const [attrId, values] of Object.entries(attributes)) {
        if (Array.isArray(values) && values.length > 0) {
          attrConditions.push({
            attributes: {
              $elemMatch: {
                attributeId: isValidObjectId(attrId) ? new Types.ObjectId(attrId) : attrId,
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

      // Auto-generate SKU Code and Slug for new SKUs if missing
      if (!_id) {
          if (!rest.skuCode) {
              const productSlug = generateSlug(product.name);
              const variantSlug = normalizedAttrs
                .filter((a: any) => a.value != null && a.value !== '')
                .map((a: any) => generateSlug(String(a.value)))
                .join('-');
              
              // Count existing SKUs for sequential suffix
              const existingSkusCount = await this.skuService.count({ productId });
              const suffix = (existingSkusCount + 1).toString().padStart(3, '0');
              
              rest.skuCode = `${productSlug}-${variantSlug}-${suffix}`.toUpperCase();
          }

          if (!rest.slug) {
             rest.slug = generateSlug(rest.skuCode);
          }
      }

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

  async getRecommended(userId?: string, limit: number = 10): Promise<IProductAttributes[]> {
    let categoryIds: any[] = [];

    if (userId) {
      // Get user's recently viewed products to extract categories
      const RecentlyViewedModel = (await import('../../db/mongodb')).RecentlyViewedModel;
      const recentViews = await RecentlyViewedModel.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(5)
        .populate('productId')
        .lean();

      const viewedProducts = recentViews.map((v: any) => v.productId).filter((p: any) => p && Array.isArray(p.categoryIds));
      categoryIds = viewedProducts.flatMap((p: any) => p.categoryIds);
    }

    // Build query
    const query: any = { status: 'ACTIVE' };
    if (categoryIds.length > 0) {
      query.categoryIds = { $in: categoryIds };
    }

    // Get recommended products
    const products = await ProductModel.find(query)
      .sort({ createdAt: -1 }) // Newest first, or could use rating/popularity
      .limit(limit)
      .lean();

    return products as any;
  }

  async getSimilar(productId: string, limit: number = 6): Promise<IProductAttributes[]> {
    // Get source product
    const sourceProduct = await ProductModel.findById(productId).lean();
    if (!sourceProduct) {
      return [];
    }

    // Calculate price range (±30%)
    const basePrice = sourceProduct.basePrice || 0;
    const minPrice = basePrice * 0.7;
    const maxPrice = basePrice * 1.3;

    // Find similar products
    const products = await ProductModel.find({
      _id: { $ne: productId }, // Exclude source product
      status: 'ACTIVE',
      categoryIds: { $in: sourceProduct.categoryIds || [] }, // Same categories
      basePrice: { $gte: minPrice, $lte: maxPrice }, // Similar price range
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return products as any;
  }

  async getFrequentlyBoughtTogether(productId: string, limit: number = 4): Promise<IProductAttributes[]> {
    // Get orders containing this product
    const OrderModel = (await import('../../db/mongodb')).OrderModel;
    const orders = await OrderModel.find({
      'items.productId': productId,
      orderStatus: { $nin: ['CANCELLED', 'FAILED'] },
    })
      .select('items')
      .limit(100) // Limit orders to analyze
      .lean();

    // Count frequency of other products
    const productFrequency: Record<string, number> = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const itemProductId = item.productId?.toString();
        if (itemProductId && itemProductId !== productId) {
          productFrequency[itemProductId] = (productFrequency[itemProductId] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top N
    const topProductIds = Object.entries(productFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id]) => id);

    if (topProductIds.length === 0) {
      return [];
    }

    // Get product details
    const products = await ProductModel.find({
      _id: { $in: topProductIds },
      status: 'ACTIVE',
    }).lean();

    return products as any;
  }


  async delete(filter: any): Promise<any> {
    // Find products to get their IDs before deletion
    const products = await this.model.find(filter).select('_id').lean();
    
    if (products.length > 0) {
      const productIds = products.map((p: any) => p._id);
      
      // Delete associated SKUs
      await this.skuService.deleteMany({ productId: { $in: productIds } } as any);
    }

    // Proceed with deleting products
    return super.delete(filter);
  }
}
 
export const productService = new ProductService();
