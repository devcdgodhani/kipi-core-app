import { Document, ObjectId } from 'mongoose';
import { REVIEW_STATUS } from '../constants/review';
import { IDefaultAttributes } from './common';

export interface IReviewAttributes extends IDefaultAttributes {
  _id: ObjectId;
  productId: ObjectId;
  userId: ObjectId;
  orderId: ObjectId;
  rating: number;
  comment: string;
  images: ObjectId[];
  status: REVIEW_STATUS;
  isVisible: boolean;
  adminReply?: string;
}

export interface IReviewDocument extends Omit<IReviewAttributes, '_id'>, Document {}
