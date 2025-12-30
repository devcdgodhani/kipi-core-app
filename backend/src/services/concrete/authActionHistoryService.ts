import { MongooseCommonService } from './mongooseCommonService';
import { IAuthActionHistoryService } from '../contracts/authActionHistoryServiceInterface';
import { IAuthActionHistoryAttributes, IAuthActionHistoryDocument } from '../../interfaces';
import { AuthActionHistoryModel } from '../../db/mongodb';

export class AuthActionHistoryService
  extends MongooseCommonService<IAuthActionHistoryAttributes, IAuthActionHistoryDocument>
  implements IAuthActionHistoryService
{
  constructor() {
    super(AuthActionHistoryModel);
  }
}
