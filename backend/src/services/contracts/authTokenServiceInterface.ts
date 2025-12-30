import { IAuthTokenAttributes, IAuthTokenDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IAuthTokenService extends IMongooseCommonService<IAuthTokenAttributes, IAuthTokenDocument> {}
