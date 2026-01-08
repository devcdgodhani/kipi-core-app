import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface ICODLedgerDiscrepancy {
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  reason?: string;
}

export interface ICODLedgerAttributes extends IDefaultAttributes {
  orderId: Types.ObjectId;
  shipmentId: Types.ObjectId;
  awb: string;
  codAmount: number;
  collectionDate?: Date;
  status: string;
  settlementBatchId?: string;
  settlementDate?: Date;
  settlementAmount?: number;
  settlementCharges?: number;
  netSettlement?: number;
  courierId: Types.ObjectId;
  courierName: string;
  remittanceId?: string;
  remittanceDate?: Date;
  remittanceMode?: string;
  utrNumber?: string;
  isReconciled: boolean;
  reconciledDate?: Date;
  reconciledBy?: Types.ObjectId;
  discrepancy?: ICODLedgerDiscrepancy;
  notes?: string;
}

export interface ICODLedgerDocument extends Omit<ICODLedgerAttributes, '_id'>, Document {}
