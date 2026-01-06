import { Schema, model, Types, Document } from 'mongoose';

export interface IShipment extends Document {
  orderId: Types.ObjectId;
  orderNumber: string;
  shipmentNumber: string;
  awb: string;
  
  courierId: Types.ObjectId;
  courierName: string;
  courierCode: string;
  serviceType: string;
  
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  volumetricWeight?: number;
  
  pickupAddress: any;
  deliveryAddress: any;
  warehouseId?: Types.ObjectId;
  
  paymentMode: 'COD' | 'PREPAID';
  codAmount?: number;
  declaredValue: number;
  shippingCost: number;
  
  status: string;
  currentLocation?: string;
  
  pickupScheduledDate?: Date;
  pickupCompletedDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  labelUrl?: string;
  manifestUrl?: string;
  invoiceUrl?: string;
  trackingUrl?: string;
  lastTrackedAt?: Date;
  
  isRTO: boolean;
  rtoReason?: string;
  rtoInitiatedDate?: Date;
  rtoDeliveredDate?: Date;
  
  hasNDR: boolean;
  ndrCount: number;
  
  providerShipmentId?: string;
  providerOrderId?: string;
  providerData?: Record<string, any>;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
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
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ awb: 1 });
shipmentSchema.index({ status: 1, createdAt: -1 });
shipmentSchema.index({ courierId: 1, createdAt: -1 });
shipmentSchema.index({ isRTO: 1, rtoDeliveredDate: -1 });
shipmentSchema.index({ warehouseId: 1, status: 1 });

export const ShipmentModel = model<IShipment>('Shipment', shipmentSchema);
