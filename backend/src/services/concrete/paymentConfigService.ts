import PaymentConfigModel from '../../db/mongodb/models/paymentConfigModel';
import { IPaymentConfig, IPaymentConfigAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';

export class PaymentConfigService extends MongooseCommonService<IPaymentConfigAttributes, IPaymentConfig> {
  constructor() {
    super(PaymentConfigModel);
  }

  async setPaymentConfig(entityType: 'CATEGORY' | 'PRODUCT', entityId: string, config: Partial<IPaymentConfigAttributes>) {
    return this.model.findOneAndUpdate(
      { entityType, entityId },
      { ...config, entityType, entityId },
      { upsert: true, new: true }
    );
  }

  async getPaymentConfig(entityType: 'CATEGORY' | 'PRODUCT', entityId: string) {
    return this.model.findOne({ entityType, entityId, isDeleted: false }).exec();
  }

  async getEffectivePaymentConfig(productId: string) {
    const ProductModel = (await import('../../db/mongodb/models/productModel')).default;
    
    // First check product-level config
    const productConfig = await this.getPaymentConfig('PRODUCT', productId);
    if (productConfig) {
      return productConfig;
    }

    // Fall back to category-level config
    const product = await ProductModel.findById(productId);
    if (product && product.category) {
      const categoryConfig = await this.getPaymentConfig('CATEGORY', product.category.toString());
      if (categoryConfig) {
        return categoryConfig;
      }
    }

    // Return default config
    return {
      codEnabled: true,
      prepaidEnabled: true,
    };
  }
}

export const paymentConfigService = new PaymentConfigService();
