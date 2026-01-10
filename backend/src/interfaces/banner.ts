import { Document, ObjectId } from 'mongoose';
import { BANNER_STATUS, BANNER_LINK_TYPE, BANNER_TARGET_AUDIENCE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IBannerAttributes extends IDefaultAttributes {
  _id: ObjectId;
  title: string;
  subtitle?: string;
  imageId: ObjectId;
  mobileImageId?: ObjectId;
  linkType: BANNER_LINK_TYPE;
  linkValue?: string;
  displayOrder: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  targetAudience: BANNER_TARGET_AUDIENCE;
  status: BANNER_STATUS;
}

export interface IBannerDocument extends Omit<IBannerAttributes, '_id'>, Document {}
