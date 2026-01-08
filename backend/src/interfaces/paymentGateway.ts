import { Document, Types } from 'mongoose';
import { PAYMENT_GATEWAY, GATEWAY_ENVIRONMENT } from '../constants/payment';

/**
 * Payment Gateway Attributes Interface
 * Defines the structure of payment gateway configuration
 */
export interface IPaymentGatewayAttributes {
  name: PAYMENT_GATEWAY;
  displayName: string;
  isEnabled: boolean;
  environment: GATEWAY_ENVIRONMENT;
  credentials: string; // Encrypted JSON string
  webhookSecret: string;
  config: {
    callbackUrl?: string;
    timeout?: number;
    retryAttempts?: number;
  };
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payment Gateway Document Interface
 * Extends Mongoose Document for database operations
 */
export interface IPaymentGatewayDocument extends IPaymentGatewayAttributes, Document {}
