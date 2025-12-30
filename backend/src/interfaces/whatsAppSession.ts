import { Document, Types } from 'mongoose';

export enum WHATSAPP_SESSION_STATUS {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  QR_READY = 'QR_READY',
}

export interface IWhatsAppSessionAttributes {
  _id: Types.ObjectId;
  name: string;
  externalId: string; // Used for whatsapp-web.js clientId
  status: WHATSAPP_SESSION_STATUS;
  qrCode?: string;
  isAutoResume: boolean;
  lastActiveAt?: number;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface IWhatsAppSessionDocument extends IWhatsAppSessionAttributes, Document {
  _id: Types.ObjectId;
}
