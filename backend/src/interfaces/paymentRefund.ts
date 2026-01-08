import { Document, Types } from 'mongoose';
import { REFUND_STATUS, REFUND_REASON } from '../constants/payment';

/**
 * Payment Refund Attributes Interface
 * Defines the structure of refund transactions
 */
export interface IPaymentRefundAttributes {
  paymentId: Types.ObjectId | string;
  orderId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  
  // Refund details
  refundNumber: string;
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
  
  // Audit
  initiatedBy: Types.ObjectId | string;
  processedBy?: Types.ObjectId | string;
  
  // Timestamps & soft delete
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Payment Refund Document Interface
 * Extends Mongoose Document for database operations
 */
export interface IPaymentRefundDocument extends IPaymentRefundAttributes, Document {}
