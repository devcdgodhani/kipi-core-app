import { ICartAttributes, ICartDocument } from '../../interfaces/cart';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ICartService extends IMongooseCommonService<ICartAttributes, ICartDocument> {}
