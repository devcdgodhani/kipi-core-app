import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';
import { LOT_TYPE, LOT_STATUS } from '../constants';

export interface ILotAttributes extends IDefaultAttributes {
  _id: ObjectId;
  lotNumber: string;
  type: LOT_TYPE;
  supplierId?: ObjectId; // Ref to User if type is SUPPLIER
  basePrice: number;
  quantity: number;
  remainingQuantity: number;
  startDate?: Date;
  endDate?: Date;
  status: LOT_STATUS;
  notes?: string;
}

export interface ILotDocument extends ILotAttributes, Document {
  _id: any;
}
