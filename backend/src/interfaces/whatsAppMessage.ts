import { Document, ObjectId } from 'mongoose';
import { WHATSAPP_MESSAGE_STATUS } from '../constants';
import { IDefaultAttributes } from './common';

export interface IWhatsAppMessageAttributes extends IDefaultAttributes {
  _id: ObjectId;
  accountId: ObjectId; // WhatsAppAccount reference
  contactId: ObjectId; // WhatsAppContact reference
  message: string;
  templateId?: ObjectId; // Optional template reference
  status: WHATSAPP_MESSAGE_STATUS;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failureReason?: string;
  jobId: string; // BullMQ job ID
}

export interface IWhatsAppMessageDocument extends Omit<IWhatsAppMessageAttributes, '_id'>, Document {}
