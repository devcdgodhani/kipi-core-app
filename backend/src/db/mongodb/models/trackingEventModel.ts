import { Schema, model } from 'mongoose';
import { ITrackingEventDocument } from '../../../interfaces/trackingEvent';

const trackingEventSchema = new Schema<ITrackingEventDocument>(
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

export const TrackingEventModel = model<ITrackingEventDocument>('TrackingEvent', trackingEventSchema);
