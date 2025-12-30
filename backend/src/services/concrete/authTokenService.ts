import { AuthTokenModel } from '../../db/mongodb';
import { IAuthTokenAttributes, IAuthTokenDocument } from '../../interfaces';
import { IAuthTokenService } from '../contracts/authTokenServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class AuthTokenService
  extends MongooseCommonService<IAuthTokenAttributes, IAuthTokenDocument>
  implements IAuthTokenService
{
  constructor() {
    super(AuthTokenModel);
  }
}
