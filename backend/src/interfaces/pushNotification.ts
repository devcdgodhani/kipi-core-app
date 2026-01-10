import { Document, Types } from 'mongoose';
import { PUSH_NOTIFICATION_STATUS, PUSH_TARGET_TYPE } from '../constants/pushNotification';
import { IDefaultAttributes } from './common';

export interface IPushNotificationAttributes extends IDefaultAttributes {
  _id: Types.ObjectId;
  title: string;
  body: string;
  imageUrl?: string;
  data?: any;
  target: {
    type: PUSH_TARGET_TYPE;
    values?: string[];
  };
  scheduling: {
    isScheduled: boolean;
    scheduledAt?: Date;
  };
  stats: {
    sentCount: number;
    successCount: number;
    failureCount: number;
  };
  status: PUSH_NOTIFICATION_STATUS;
  createdBy?: Types.ObjectId;
}

export interface IPushNotificationDocument extends Omit<IPushNotificationAttributes, '_id'>, Document {}
