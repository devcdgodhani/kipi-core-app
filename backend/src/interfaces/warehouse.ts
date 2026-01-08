import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IWarehouseAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
}

export interface IWarehouseAttributes extends IDefaultAttributes {
  name: string;
  code: string;
  address: IWarehouseAddress;
  contactPerson: string;
  mobile: string;
  email: string;
  isActive: boolean;
  isPrimary: boolean;
  operatingHours?: Record<string, any>;
  serviceablePincodes?: string[];
  maxCapacity?: number;
  currentUtilization?: number;
}

export interface IWarehouseDocument extends Omit<IWarehouseAttributes, '_id'>, Document {}
