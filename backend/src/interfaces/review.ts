import { Document, ObjectId } from 'mongoose';
import { REVIEW_STATUS } from '../constants/review';
import { IDefaultAttributes } from './common';

export interface IReviewAttributes extends IDefaultAttributes {
  _id: ObjectId;
  productId: ObjectId;
  userId: ObjectId;
  rating: number;
  comment: string;
  status: REVIEW_STATUS;
  isVisible: boolean;
}

export interface IReviewDocument extends Omit<IReviewAttributes, '_id'>, Document {}
