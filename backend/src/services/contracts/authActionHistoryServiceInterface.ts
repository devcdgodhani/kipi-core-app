import { IAuthActionHistoryAttributes, IAuthActionHistoryDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IAuthActionHistoryService
  extends IMongooseCommonService<IAuthActionHistoryAttributes, IAuthActionHistoryDocument> {}
