import { Document, ObjectId } from 'mongoose';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface INotificationAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  type: NOTIFICATION_TYPE;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  imageUrl?: string;
  actionUrl?: string;
  status: NOTIFICATION_STATUS;
}

export interface INotificationDocument extends Omit<INotificationAttributes, '_id'>, Document {}
