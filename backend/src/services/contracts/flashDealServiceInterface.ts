import { IFlashDealAttributes, IFlashDealDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IFlashDealService extends IMongooseCommonService<IFlashDealAttributes, IFlashDealDocument> {}
