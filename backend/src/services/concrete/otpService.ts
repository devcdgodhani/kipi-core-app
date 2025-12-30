import { OtpModel } from '../../db/mongodb';
import { IOtpAttributes, IOtpDocument } from '../../interfaces';
import { IOtpService } from '../contracts/otpServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class OtpService
  extends MongooseCommonService<IOtpAttributes, IOtpDocument>
  implements IOtpService
{
  constructor() {
    super(OtpModel);
  }
}
