import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export type ExchangeStatus = 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RECEIVED' | 'INSPECTED' | 'NEW_ORDER_CREATED' | 'CANCELLED';

export interface IExchangeItem {
  originalSkuId: Types.ObjectId;
  exchangeSkuId: Types.ObjectId;
  quantity: number;
  reason: string;
  condition: string;
}

export interface IExchangeAttributes extends IDefaultAttributes {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  items: IExchangeItem[];
  status: ExchangeStatus;
  logisticsId?: Types.ObjectId;
  replacementOrderId?: Types.ObjectId;
  adminNotes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface IExchangeDocument extends Omit<IExchangeAttributes, '_id'>, Document {}
