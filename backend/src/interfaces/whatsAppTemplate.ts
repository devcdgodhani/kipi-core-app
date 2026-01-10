import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IWhatsAppTemplateAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  template: string; // "Hello {{name}}, your order {{orderId}} is ready!"
  variables: string[]; // ["name", "orderId"]
  category: string; // "order_update", "otp", etc.
  isActive: boolean;
}

export interface IWhatsAppTemplateDocument extends Omit<IWhatsAppTemplateAttributes, '_id'>, Document {}
