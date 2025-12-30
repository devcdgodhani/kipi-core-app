import ProductModel from '../../db/mongodb/models/productModel';
import SkuModel from '../../db/mongodb/models/skuModel';
import InventoryModel from '../../db/mongodb/models/inventoryModel';
import LotModel from '../../db/mongodb/models/lotModel';
import { IProduct, IProductAttributes, ISku } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import mongoose from 'mongoose';

export class ProductService extends MongooseCommonService<IProductAttributes, IProduct> {
  constructor() {
    super(ProductModel);
  }

  async createWithVariants(data: any): Promise<IProduct> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Create Base Product
      const productData = { ...data };
      delete productData.variants; // Remove variants from product creation
      
      const product = new ProductModel(productData);
      await product.save({ session });

      // 2. Create Variants (SKUs)
      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          const sku = new SkuModel({
            ...v,
            product: product._id,
            attributes: v.attributes?.map((a: any) => ({
              ...a,
              attributeId: a.attributeId || a.attribute
            }))
          });
          await sku.save({ session });

          // 3. Create Inventory Record
          await InventoryModel.create([{
            sku: sku._id,
            totalAvailableStock: (sku as any).stock || 0,
            totalReservedStock: 0,
            lowStockThreshold: 10
          }], { session });

        }
      }

      await session.commitTransaction();
      session.endSession();
      
      return product;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updateWithVariants(id: string, data: any): Promise<IProduct | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Update Base Product
      const productData = { ...data };
      const variants = productData.variants;
      delete productData.variants;

      const product = await ProductModel.findByIdAndUpdate(id, productData, { new: true, session });
      if (!product) throw new Error('Product not found');

      // 2. Sync Variants (SKUs)
      if (variants !== undefined) {
        const incomingVariants = variants || [];
        
        // Get existing SKUs
        const existingSkus = await SkuModel.find({ product: id }).session(session);
        const existingSkuIds = existingSkus.map((s: any) => s._id.toString());

        const incomingSkuIds = incomingVariants
          .filter((v: any) => v._id)
          .map((v: any) => v._id.toString());
        
        // 1. Delete SKUs not in incoming list
        const idsToDelete = existingSkuIds.filter(id => !incomingSkuIds.includes(id));
        if (idsToDelete.length > 0) {
          await SkuModel.deleteMany({ _id: { $in: idsToDelete } }, { session });
          await InventoryModel.deleteMany({ sku: { $in: idsToDelete } }, { session });
        }

        // 2. Upsert/Create incoming SKUs
        for (const variant of incomingVariants) {
          const skuData = {
            ...variant,
            product: id,
            attributes: variant.attributes?.map((a: any) => ({
              ...a,
              attributeId: a.attributeId || a.attribute
            }))
          };

          let skuId = variant._id;

          if (variant._id) {
            // Update existing SKU
            await SkuModel.findByIdAndUpdate(variant._id, skuData, { session });
            
            // Sync Inventory if stock is provided
            if (variant.stock !== undefined) {
              await InventoryModel.findOneAndUpdate(
                { sku: variant._id },
                { totalAvailableStock: variant.stock },
                { session }
              );
            }
          } else {
            // Create new SKU
            const newSku = new SkuModel(skuData);
            await newSku.save({ session });
            skuId = newSku._id;

            // Create Inventory Record
            await InventoryModel.create([{
              sku: newSku._id,
              totalAvailableStock: variant.stock || 0,
              totalReservedStock: 0,
              lowStockThreshold: 10
            }], { session });
          }

        }
      }

      await session.commitTransaction();
      session.endSession();
      
      return product;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getWithSkus(id: string): Promise<IProduct | null> {
    const doc = await this.model.findById(id)
      .populate('category')
      .populate({
        path: 'skus',
        populate: { path: 'lotId' }
      })
      .exec();
    return doc ? doc.toObject({ virtuals: true }) : null;
  }
}

export const productService = new ProductService();
