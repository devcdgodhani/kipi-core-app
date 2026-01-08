import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IRtoAttributes extends IDefaultAttributes {
  shipmentId: Types.ObjectId;
  orderId: Types.ObjectId;
  awb: string;
  rtoInitiatedDate: Date;
  rtoDeliveredDate?: Date;
  rtoReason: string;
  rtoReasonText: string;
  status: string;
  rtoCost?: number;
  codRecovery?: number;
  qcStatus: string;
  qcDate?: Date;
  qcBy?: Types.ObjectId;
  qcNotes?: string;
  qcImages?: string[];
  restockStatus: string;
  restockDate?: Date;
  restockBy?: Types.ObjectId;
  restockNotes?: string;
  disposition: string;
  providerRTOId?: string;
  providerData?: Record<string, any>;
}

export interface IRtoDocument extends Omit<IRtoAttributes, '_id'>, Document {}

export interface IRtoScoreAttributes {
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
  riskScore: number;
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    customerHistory: number;
    pincodeRisk: number;
    orderValueRisk: number;
    accountAgeRisk: number;
  };
  suggestedAction: 'ALLOW' | 'FLAG' | 'BLOCK_COD';
  adminAction?: 'ALLOW' | 'BLOCK';
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRtoScoreDocument extends Omit<IRtoScoreAttributes, 'orderId' | 'customerId'>, Document {
  orderId: Types.ObjectId;
  customerId: Types.ObjectId;
}
