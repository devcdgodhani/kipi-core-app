import { Document, Types } from 'mongoose';
import { PAYMENT_GATEWAY, PAYMENT_STATUS } from '../constants/payment';
import { IDefaultAttributes } from './common';

/**
 * Payment Attributes Interface
 * Defines the structure of payment transactions
 */
export interface IPaymentAttributes extends IDefaultAttributes {
  orderId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  
  // Gateway information
  gatewayName: PAYMENT_GATEWAY;
  gatewayTransactionId?: string;
  gatewayOrderId?: string;
  internalPaymentId: string;
  
  // Amount details
  amount: number;
  currency: string;
  
  // Status tracking
  status: PAYMENT_STATUS;
  
  // Metadata
  metadata: {
    paymentMethod?: string;
    upiId?: string;
    cardLast4?: string;
    cardNetwork?: string;
    bankName?: string;
    gatewayResponse?: Record<string, any>;
  };
  
  // Webhook processing
  webhookReceivedAt?: Date;
  webhookProcessedAt?: Date;
  
  // Idempotency
  idempotencyKey: string;
  
  // Refund tracking
  refundedAmount: number;
  refundCount: number;
}

/**
 * Payment Document Interface
 * Extends Mongoose Document for database operations
 */
export interface IPaymentDocument extends Omit<IPaymentAttributes, '_id'>, Document {}
