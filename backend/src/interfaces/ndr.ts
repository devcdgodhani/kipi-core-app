import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface INDRAttributes extends IDefaultAttributes {
  shipmentId: Types.ObjectId;
  orderId: Types.ObjectId;
  awb: string;
  ndrDate: Date;
  ndrReason: string;
  ndrReasonText: string;
  attemptNumber: number;
  status: string;
  customerAction?: string;
  customerActionDate?: Date;
  rescheduledDate?: Date;
  rescheduledTimeSlot?: string;
  updatedAddress?: any;
  resolution?: string;
  resolvedDate?: Date;
  resolvedBy?: Types.ObjectId;
  providerNDRId?: string;
  providerData?: Record<string, any>;
}

export interface INDRDocument extends Omit<INDRAttributes, '_id'>, Document {}
