import { Document, ObjectId } from 'mongoose';
import { WHATSAPP_ACCOUNT_STATUS, WHATSAPP_CONNECTION_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface IWhatsAppAccountAttributes extends IDefaultAttributes {
  _id: ObjectId;
  // Session Fields
  name: string; // Friendly name for the session/account
  externalId: string; // client_id for whatsapp-web.js
  socketStatus: WHATSAPP_CONNECTION_STATUS; // connection state
  qrCode?: string; // current QR code if not connected
  isAuthenticated: boolean;
  isAutoResume: boolean;

  // Account Fields
  number?: string; // WhatsApp number (unique), optional until connected
  activatedAt?: Date; // First QR login date (System set)
  numberActivatedAt?: Date; // Optional manual entry for SIM activation date
  status: WHATSAPP_ACCOUNT_STATUS;
  sentToday: number;
  sentThisHour: number;
  lastSentAt?: Date;
  riskScore: number;
  metadata: {
    totalSent: number;
    totalFailed: number;
    totalReplies: number;
  };
}

export interface IWhatsAppAccountDocument extends Omit<IWhatsAppAccountAttributes, '_id'>, Document {}
