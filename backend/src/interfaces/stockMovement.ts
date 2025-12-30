import { Document, Types } from 'mongoose';
import { STOCK_MOVEMENT_TYPE } from '../constants';

export interface IStockMovementAttributes {
  movementType: STOCK_MOVEMENT_TYPE;
  sku: Types.ObjectId;
  lot?: Types.ObjectId;
  quantity: number;
  reference?: string;
  reason?: string;
  performedBy?: Types.ObjectId;
}

export interface IStockMovement extends Document, IStockMovementAttributes {
  createdAt: Date;
  updatedAt: Date;
}
