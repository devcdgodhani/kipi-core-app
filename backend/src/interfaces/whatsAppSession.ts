import { Document, ObjectId } from 'mongoose';
import { WHATSAPP_SESSION_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface IWhatsAppSessionAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  externalId: string; // Used for whatsapp-web.js clientId
  status: WHATSAPP_SESSION_STATUS;
  qrCode?: string;
  isAutoResume: boolean;
  lastActiveAt?: number;
  isActive: boolean;
}

export interface IWhatsAppSessionDocument extends Omit<IWhatsAppSessionAttributes, '_id'>, Document {}
