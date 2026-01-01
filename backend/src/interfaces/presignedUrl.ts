import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IPresignedUrlAttributes extends IDefaultAttributes {
  _id: ObjectId;
  fileId: ObjectId;
  url: string;
  expiresAt: Date;
}

export interface IPresignedUrlDocument extends Omit<IPresignedUrlAttributes, '_id'>, Document {}
