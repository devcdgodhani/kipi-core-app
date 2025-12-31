import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';
import { CATEGORY_STATUS } from '../constants';

export interface ICategoryAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  slug: string;
  parentId?: ObjectId; // Ref to Category (Self Reference)
  description?: string;
  image?: string;
  status: CATEGORY_STATUS;
  order: number;
  attributeIds?: ObjectId[]; // Ref to Attribute
}


export interface ICategoryDocument extends ICategoryAttributes, Document {
  _id: any;
}
