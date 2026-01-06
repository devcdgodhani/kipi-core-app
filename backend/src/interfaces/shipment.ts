import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IShipmentAttributes extends IDefaultAttributes {
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
}

export interface IShipmentDocument extends Omit<IShipmentAttributes, '_id'>, Document {}
