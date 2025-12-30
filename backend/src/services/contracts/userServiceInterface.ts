import { IUserAttributes, IUserDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IUserService extends IMongooseCommonService<IUserAttributes, IUserDocument> {}
