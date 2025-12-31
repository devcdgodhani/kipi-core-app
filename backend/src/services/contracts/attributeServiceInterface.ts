import { IAttributeAttributes, IAttributeDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IAttributeService extends IMongooseCommonService<IAttributeAttributes, IAttributeDocument> {}
