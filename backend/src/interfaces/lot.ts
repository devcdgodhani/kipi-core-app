import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';
import { LOT_TYPE, LOT_STATUS, ADJUST_QUANTITY_TYPE } from '../constants';

export interface IAdjustQuantity {
  quantity: number;
  type: ADJUST_QUANTITY_TYPE;
  reason: string;
  date?: Date;
}

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
  adjustQuantity?: IAdjustQuantity[];
  status: LOT_STATUS;
  notes?: string;
}

export interface ILotDocument extends ILotAttributes, Document {
  _id: any;
}
