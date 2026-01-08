import { Document, Types } from 'mongoose';
import { REFUND_STATUS, REFUND_REASON, PAYMENT_GATEWAY } from '../constants/payment';
import { IDefaultAttributes } from './common';

/**
 * Payment Refund Attributes Interface
 * Defines the structure of refund transactions
 */
export interface IPaymentRefundAttributes extends IDefaultAttributes {
  paymentId: Types.ObjectId | string;
  orderId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  
  // Refund details
  refundNumber: string;
  gatewayName: PAYMENT_GATEWAY;
  gatewayRefundId?: string;
  amount: number;
  reason: REFUND_REASON;
  notes?: string;
  
  // Status tracking
  status: REFUND_STATUS;
  
  // Gateway response
  gatewayResponse?: Record<string, any>;
  
  // Timestamps
  initiatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  
  // Audit details
  initiatedBy: Types.ObjectId | string;
  processedBy?: Types.ObjectId | string;
}

/**
 * Payment Refund Document Interface
 * Extends Mongoose Document for database operations
 */
export interface IPaymentRefundDocument extends Omit<IPaymentRefundAttributes, '_id'>, Document {}
