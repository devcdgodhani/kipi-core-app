import mongoose, { ConnectOptions } from 'mongoose';
import { TMongoDbConfig } from '../../types/common'; 
import { baseSchemaPlugin } from './plugins/baseSchema';
import { softDeletePlugin } from './plugins/softDeletePlugin';

mongoose.plugin(baseSchemaPlugin);
mongoose.plugin(softDeletePlugin);

export const connectMongoDb = async (config: TMongoDbConfig) => {
  try {
    await mongoose.connect(config.connectionUrl, {
      dbName: config.dbName,
    } as ConnectOptions);

    // Data Sanitization: Fix empty string ObjectIds that cause CastErrors during population
    try {
      const Product = mongoose.model('Product');
      const Sku = mongoose.model('Sku');

      await Promise.all([
        Product.updateMany({ mainImage: '' }, { $set: { mainImage: null } }),
        Product.updateMany({}, { $pull: { categoryIds: '' } } as any),
        Product.updateMany(
          { 'media.fileStorageId': '' },
          { $set: { 'media.$[elem].fileStorageId': null } },
          { arrayFilters: [{ 'elem.fileStorageId': '' }] } as any
        ),
        Sku.updateMany({ productId: '' }, { $set: { productId: null } }),
        Sku.updateMany({ lotId: '' }, { $set: { lotId: null } }),
        Sku.updateMany(
          { 'media.fileStorageId': '' },
          { $set: { 'media.$[elem].fileStorageId': null } },
          { arrayFilters: [{ 'elem.fileStorageId': '' }] } as any
        )
      ]);
      console.log('Database references sanitized successfully');
    } catch (dbErr) {
      console.error('Database sanitization failed:', dbErr);
    }
  } catch (err) {
    console.log('error while connect mongoDb : ' + err);
    throw err;
  }
};


/****************** models import **********************/
export * from './models/authActionHistoryModel';
export * from './models/authTokenModel';
export * from './models/otpModel';
export * from './models/userModel';
export * from './models/whatsAppSessionModel';
export * from './models/lotModel';
export * from './models/categoryModel';
export * from './models/attributeModel';
export * from './models/fileStorageModel';
export * from './models/presignedUrlModel';
export * from './models/fileDirectoryModel';
export * from './models/productModel';
export * from './models/skuModel';