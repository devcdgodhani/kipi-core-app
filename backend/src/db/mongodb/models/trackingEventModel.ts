import { Schema, model, Types, Document } from 'mongoose';

export interface ITrackingEvent extends Document {
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
  createdAt: Date;
}

const trackingEventSchema = new Schema<ITrackingEvent>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    awb: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    status: { type: String, required: true },
    statusCode: { type: String },
    location: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    timestamp: { type: Date, required: true, index: true },
    message: { type: String, required: true },
    description: { type: String },
    courierPersonnel: { type: String },
    providerEventId: { type: String, unique: true, sparse: true },
    providerData: { type: Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

// Indexes
trackingEventSchema.index({ shipmentId: 1, timestamp: -1 });
trackingEventSchema.index({ awb: 1, timestamp: -1 });
trackingEventSchema.index({ eventType: 1, timestamp: -1 });

export const TrackingEventModel = model<ITrackingEvent>('TrackingEvent', trackingEventSchema);
