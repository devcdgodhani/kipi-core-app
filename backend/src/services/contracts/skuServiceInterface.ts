import { ISkuAttributes, ISkuDocument } from '../../interfaces/sku';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ISkuService extends IMongooseCommonService<ISkuAttributes, ISkuDocument> {}
