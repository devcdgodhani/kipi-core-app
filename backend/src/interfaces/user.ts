import { ObjectId } from 'mongoose';
import { GENDER, SIGN_UP_TYPE, USER_STATUS, USER_TYPE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IUserAttributes extends IDefaultAttributes {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  password?: string;
  mobile: string;
  countryCode?: string;
  email: string;
  type: USER_TYPE;
  gender: GENDER;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  signUpType?: SIGN_UP_TYPE;
  isVerified: boolean;
  status: USER_STATUS;
}

export interface IUserDocument extends Omit<IUserAttributes, '_id'>, Document {}
