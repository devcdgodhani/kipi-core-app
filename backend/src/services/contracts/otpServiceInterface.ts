import { IOtpAttributes, IOtpDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IOtpService extends IMongooseCommonService<IOtpAttributes, IOtpDocument> {}
