import { Document, ObjectId } from 'mongoose';
import { WHATSAPP_RISK_EVENT_TYPE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IWhatsAppRiskEventAttributes extends IDefaultAttributes {
  _id: ObjectId;
  accountId: ObjectId; // WhatsAppAccount reference
  eventType: WHATSAPP_RISK_EVENT_TYPE;
  points: number; // +/- points
  timestamp: Date;
  metadata?: Record<string, any>; // Event-specific data
}

export interface IWhatsAppRiskEventDocument extends Omit<IWhatsAppRiskEventAttributes, '_id'>, Document {}
