import { Document, ObjectId } from 'mongoose';
import { RECENTLY_VIEWED_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface IRecentlyViewedAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  productId: ObjectId;
  viewedAt: Date;
  status: RECENTLY_VIEWED_STATUS;
}

export interface IRecentlyViewedDocument extends Omit<IRecentlyViewedAttributes, '_id'>, Document {}
