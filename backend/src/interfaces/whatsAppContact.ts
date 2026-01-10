import { Document, ObjectId } from 'mongoose';
import { WHATSAPP_CONTACT_STATE } from '../constants';
import { IDefaultAttributes } from './common';

export interface IWhatsAppContactAttributes extends IDefaultAttributes {
  _id: ObjectId;
  mobile: string; // Unique
  consent: boolean; // Explicit consent flag
  state: WHATSAPP_CONTACT_STATE; // Engagement state
  lastRepliedAt?: Date;
  totalReplies: number;
  metadata: {
    firstContactedAt: Date;
    lastContactedAt?: Date;
    totalMessagesSent: number;
  };
}

export interface IWhatsAppContactDocument extends Omit<IWhatsAppContactAttributes, '_id'>, Document {}
