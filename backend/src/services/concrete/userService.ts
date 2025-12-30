import { UserModel } from '../../db/mongodb';
import { IUserAttributes, IUserDocument } from '../../interfaces';
import { IUserService } from '../contracts';
import { MongooseCommonService } from './mongooseCommonService';

export class UserService
  extends MongooseCommonService<IUserAttributes, IUserDocument>
  implements IUserService
{
  constructor() {
    super(UserModel);
  }
}
export const userService = new UserService();
