import { Document, Types } from 'mongoose';
import { SOURCE_TYPE } from '../constants';

export interface ILotAttributes {
  lotNumber: string;
  sourceType: SOURCE_TYPE;
  supplierId?: Types.ObjectId; // Reference to User with type SUPPLIER
  manufacturingDate?: Date;
  expiryDate?: Date;
  costPerUnit: number;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  damagedQuantity: number;
  purchaseOrderReference?: string;
  qualityCheckStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  notes?: string;
}

export interface ILot extends Document, ILotAttributes {}
