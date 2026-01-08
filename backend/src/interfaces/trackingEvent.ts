import { Document, Types } from 'mongoose';

export interface ITrackingEventAttributes {
  shipmentId: Types.ObjectId;
  awb: string;
  eventType: string;
  status: string;
  statusCode?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  timestamp: Date;
  message: string;
  description?: string;
  courierPersonnel?: string;
  providerEventId?: string;
  providerData?: Record<string, any>;
  createdAt?: Date;
}

export interface ITrackingEventDocument extends ITrackingEventAttributes, Document {}
