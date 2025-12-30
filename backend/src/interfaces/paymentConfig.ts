import { Document, Types } from 'mongoose';

export interface IPaymentConfigAttributes {
  entityType: 'CATEGORY' | 'PRODUCT';
  entityId: Types.ObjectId;
  codEnabled: boolean;
  prepaidEnabled: boolean;
  codCharges?: {
    type: 'FIXED' | 'PERCENTAGE';
    value: number;
  };
  minOrderValue?: number;
  maxCodAmount?: number;
}

export interface IPaymentConfig extends Document, IPaymentConfigAttributes {}
