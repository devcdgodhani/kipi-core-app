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
    // We use the native connection to bypass Mongoose schema validation/casting
    try {
      const db = mongoose.connection.db;
      if (db) {
        console.log('Synchronizing database architecture...');
        await Promise.all([
          db.collection('products').updateMany({ mainImage: '' }, { $set: { mainImage: null } }),
          db.collection('products').updateMany({}, { $pull: { categoryIds: '' } } as any),
          db.collection('products').updateMany(
            { 'media.fileStorageId': '' },
            { $set: { 'media.$[elem].fileStorageId': null } },
            { arrayFilters: [{ 'elem.fileStorageId': '' }] } as any
          ),
          db.collection('skus').updateMany({ productId: '' }, { $set: { productId: null } }),
          db.collection('skus').updateMany({ lotId: '' }, { $set: { lotId: null } }),
          db.collection('skus').updateMany(
            { 'media.fileStorageId': '' },
            { $set: { 'media.$[elem].fileStorageId': null } },
            { arrayFilters: [{ 'elem.fileStorageId': '' }] } as any
          )
        ]);
        console.log('Database references sanitized successfully');
      }
    } catch (dbErr) {
      console.error('Database sanitization failed (non-critical):', dbErr);
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