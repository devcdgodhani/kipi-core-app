import { ObjectId, Document } from 'mongoose';
import { TOKEN_TYPE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IAuthTokenAttributes extends IDefaultAttributes {
  _id: ObjectId;
  token: string;
  type: TOKEN_TYPE;
  userId: ObjectId;
  expiredAt: number;
  referenceTokenId?: ObjectId;
}

export interface IAuthTokenDocument extends Omit<IAuthTokenAttributes, '_id'>, Document {}
