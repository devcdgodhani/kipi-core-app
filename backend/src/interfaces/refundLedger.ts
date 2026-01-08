import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IRefundLedgerBankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
}

export interface IRefundLedgerBreakdown {
  itemAmount: number;
  shippingRefund: number;
  taxRefund: number;
  discountAdjustment: number;
  pointsAdjustment: number;
}

export interface IRefundLedgerAttributes extends IDefaultAttributes {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  returnId?: Types.ObjectId;
  rtoId?: Types.ObjectId;
  refundNumber: string;
  refundType: string;
  amount: number;
  refundMethod: string;
  status: string;
  paymentGateway?: string;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  bankDetails?: IRefundLedgerBankDetails;
  initiatedDate: Date;
  processedDate?: Date;
  completedDate?: Date;
  failedDate?: Date;
  failureReason?: string;
  retryCount: number;
  breakdown?: IRefundLedgerBreakdown;
  notes?: string;
  processedBy?: Types.ObjectId;
}

export interface IRefundLedgerDocument extends Omit<IRefundLedgerAttributes, '_id'>, Document {}
