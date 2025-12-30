import mongoose, { ConnectOptions } from 'mongoose';
import { TMongoDbConfig } from '../../types'; 
import { baseSchemaPlugin } from './plugins/baseSchema';
import { softDeletePlugin } from './plugins/softDeletePlugin';

mongoose.plugin(baseSchemaPlugin);
mongoose.plugin(softDeletePlugin);

export const connectMongoDb = async (config: TMongoDbConfig) => {
  try {
    await mongoose.connect(config.connectionUrl, {
      dbName: config.dbName,
    } as ConnectOptions);
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
export * from './models/categoryModel';
export * from './models/attributeModel';
export * from './models/productModel';
export * from './models/skuModel';
export * from './models/lotModel';
export * from './models/inventoryModel';
export * from './models/couponModel';
export * from './models/paymentConfigModel';
export * from './models/stockMovementModel';