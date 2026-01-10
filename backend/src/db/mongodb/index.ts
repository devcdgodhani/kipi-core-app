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

export * from './models/whatsAppAccountModel';
export * from './models/whatsAppContactModel';
export * from './models/whatsAppMessageModel';
export * from './models/whatsAppRiskEventModel';
export * from './models/whatsAppTemplateModel';
export * from './models/lotModel';
export * from './models/categoryModel';
export * from './models/attributeModel';
export * from './models/fileStorageModel';
export * from './models/presignedUrlModel';
export * from './models/fileDirectoryModel';
export * from './models/productModel';
export * from './models/skuModel';
export * from './models/orderModel';
export * from './models/stockLedgerModel';
export * from './models/returnModel';
export * from './models/exchangeModel';
export * from './models/reviewModel';
export * from './models/loyaltyTransactionModel';
export * from './models/couponModel';
export * from './models/addressModel';
export * from './models/cartModel';
export * from './models/wishlistModel';

// Logistics models
export * from './models/shipmentModel';
export * from './models/courierModel';
export * from './models/warehouseModel';
export * from './models/trackingEventModel';
export * from './models/ndrModel';
export * from './models/rtoModel';
export * from './models/refundLedgerModel';
export * from './models/codLedgerModel';
export * from './models/webhookLogModel';
export * from './models/rtoScoreModel';
export * from './models/cronJobModel';
export * from './models/bannerModel';
export * from './models/notificationModel';
export * from './models/flashDealModel';
export * from './models/searchQueryModel';
export * from './models/recentlyViewedModel';

// Payment gateway models
export * from './models/paymentGatewayModel';
export * from './models/paymentModel';
export * from './models/paymentRefundModel';