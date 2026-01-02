import { Document, ObjectId } from 'mongoose';
import { CART_STATUS } from '../constants/cart';
import { IDefaultAttributes } from './common';

export interface ICartItem {
  skuId: ObjectId;
  productId: ObjectId;
  quantity: number;
  price: number;
  salePrice?: number;
  offerPrice?: number;
}

export interface ICartAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  items: ICartItem[];
  totalPrice: number;
  totalItems: number;
  status: CART_STATUS;
}

export interface ICartDocument extends Omit<ICartAttributes, '_id'>, Document {}
