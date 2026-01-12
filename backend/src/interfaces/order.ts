import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface IOrderItem {
  productId: string | ObjectId;
  skuId?: string | ObjectId;
  name: string;
  skuCode?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrderAddress {
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
}

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  message: string;
}

export interface IOrderAttributes extends IDefaultAttributes {
  _id: ObjectId;
  userId: string | ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  subTotal: number;
  couponId?: string | ObjectId;
  couponCode?: string;
  discountAmount?: number;
  walletAmountUsed?: number;
  cashbackAmount?: number;
  tax: number;
  shippingCost: number;
  shippingProvider?: string;
  courierId?: string | ObjectId;
  trackingId?: string;
  estimatedDelivery?: Date;
  shippingLabelUrl?: string;
  totalAmount: number;
  timeline: IOrderTimeline[];
  notes?: string;
  
  // Logistics fields
  shipmentId?: string | ObjectId;
  awb?: string;
  idempotencyKey?: string;
  isRTO?: boolean;
  rtoId?: string | ObjectId;
  hasNDR?: boolean;
  ndrCount?: number;
  warehouseId?: string | ObjectId;
  
  // Payment gateway integration
  paymentId?: string | ObjectId;
}

export interface IOrderDocument extends Omit<IOrderAttributes, '_id'>, Document {}
