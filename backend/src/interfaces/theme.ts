import { Document, ObjectId } from 'mongoose';
import { THEME_APP_NAME, THEME_STATUS } from '../constants/theme';
import { IDefaultAttributes } from './common';

export interface IThemeColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  [key: string]: string;
}

export interface IThemeAttributes extends IDefaultAttributes {
  _id: ObjectId;
  appName: THEME_APP_NAME;
  name?: string;
  colors: IThemeColors;
  status: THEME_STATUS;
}

export interface IThemeDocument extends Omit<IThemeAttributes, '_id'>, Document {}
