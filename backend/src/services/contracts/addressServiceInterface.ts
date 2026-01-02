import { IAddressAttributes, IAddressDocument } from '../../interfaces/address';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IAddressService extends IMongooseCommonService<IAddressAttributes, IAddressDocument> {}
