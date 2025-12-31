import { IProductAttributes, IProductDocument } from '../../interfaces/product';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IProductService extends IMongooseCommonService<IProductAttributes, IProductDocument> {}
