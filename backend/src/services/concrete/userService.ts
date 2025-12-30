import { UserModel } from '../../db/mongodb';
import { IUserAttributes, IUserDocument } from '../../interfaces';
import { IUserService } from '../contracts/userServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class UserService
  extends MongooseCommonService<IUserAttributes, IUserDocument>
  implements IUserService
{
  constructor() {
    super(UserModel);
  }
}
