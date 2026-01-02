import { Document, ObjectId } from 'mongoose';
import { WISHLIST_STATUS } from '../constants/wishlist';
import { IDefaultAttributes } from './common';

export interface IWishlistItem {
  productId: ObjectId;
  addedAt: Date;
}

export interface IWishlistAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  products: IWishlistItem[];
  status: WISHLIST_STATUS;
}

export interface IWishlistDocument extends Omit<IWishlistAttributes, '_id'>, Document {}
