import { Document, ObjectId } from 'mongoose';
import { ADDRESS_TYPE, ADDRESS_STATUS } from '../constants/address';
import { IDefaultAttributes } from './common';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddressAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  mobile: string;
  alternateMobile?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: ADDRESS_TYPE;
  location?: ILocation;
  isDefault: boolean;
  status: ADDRESS_STATUS;
}

export interface IAddressDocument extends Omit<IAddressAttributes, '_id'>, Document {}
