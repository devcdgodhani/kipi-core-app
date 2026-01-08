import { Schema, model } from 'mongoose';
import { IShipmentDocument } from '../../../interfaces/shipment';

const shipmentSchema = new Schema<IShipmentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    shipmentNumber: { type: String, required: true, unique: true },
    awb: { type: String, required: true, unique: true, index: true },
    
    courierId: { type: Schema.Types.ObjectId, ref: 'Courier', required: true },
    courierName: { type: String, required: true },
    courierCode: { type: String, required: true },
    serviceType: { type: String, required: true },
    
    weight: { type: Number, required: true, min: 0.1 },
    dimensions: {
      length: { type: Number, required: true, min: 1 },
      width: { type: Number, required: true, min: 1 },
      height: { type: Number, required: true, min: 1 }
    },
    volumetricWeight: { type: Number },
    
    pickupAddress: { type: Schema.Types.Mixed, required: true },
    deliveryAddress: { type: Schema.Types.Mixed, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    
    paymentMode: { type: String, enum: ['COD', 'PREPAID'], required: true },
    codAmount: { type: Number, min: 0 },
    declaredValue: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    
    status: { type: String, required: true, index: true },
    currentLocation: { type: String },
    
    pickupScheduledDate: { type: Date },
    pickupCompletedDate: { type: Date },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    
    labelUrl: { type: String },
    manifestUrl: { type: String },
    invoiceUrl: { type: String },
    trackingUrl: { type: String },
    lastTrackedAt: { type: Date },
    
    isRTO: { type: Boolean, default: false, index: true },
    rtoReason: { type: String },
    rtoInitiatedDate: { type: Date },
    rtoDeliveredDate: { type: Date },
    
    hasNDR: { type: Boolean, default: false },
    ndrCount: { type: Number, default: 0 },
    
    providerShipmentId: { type: String },
    providerOrderId: { type: String },
    providerData: { type: Schema.Types.Mixed },
    
    notes: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ courierId: 1, createdAt: -1 });
shipmentSchema.index({ isRTO: 1, rtoDeliveredDate: -1 });
shipmentSchema.index({ warehouseId: 1, status: 1 });

export const ShipmentModel = model<IShipmentDocument>('Shipment', shipmentSchema);
