import { Schema, model, Document } from 'mongoose';
import { IOrder } from '../../../types/order';
export interface IOrderDocument extends IOrder, Document {}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  skuId: { type: Schema.Types.ObjectId, ref: 'Sku' },
  name: { type: String, required: true },
  skuCode: { type: String },
  image: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const OrderAddressSchema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String }
});

const OrderSchema = new Schema<IOrderDocument>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'users', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [OrderItemSchema],
  shippingAddress: { type: OrderAddressSchema, required: true },
  billingAddress: { type: OrderAddressSchema, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'ONLINE'], 
    default: 'COD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], 
    default: 'PENDING' 
  },
  orderStatus: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'], 
    default: 'PENDING' 
  },
  subTotal: { type: Number, required: true, min: 0 },
  couponId: { type: Schema.Types.ObjectId as any, ref: 'Coupon' },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },
  pointsAmount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  shippingProvider: { type: String },
  courierId: { type: Schema.Types.ObjectId, ref: 'Courier' },
  trackingId: { type: String },
  estimatedDelivery: { type: Date },
  shippingLabelUrl: { type: String },
  timeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      message: { type: String, required: true }
    }
  ],
  notes: { type: String },
  
  // Logistics fields
  shipmentId: { type: Schema.Types.ObjectId as any, ref: 'Shipment' },
  awb: { type: String },
  idempotencyKey: { type: String, unique: true, sparse: true },
  isRTO: { type: Boolean, default: false },
  rtoId: { type: Schema.Types.ObjectId as any, ref: 'RTO' },
  hasNDR: { type: Boolean, default: false },
  ndrCount: { type: Number, default: 0 },
  warehouseId: { type: Schema.Types.ObjectId as any, ref: 'Warehouse' }
}, {
  timestamps: true,
  versionKey: false
});

// Index for order lookups

OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ shipmentId: 1 });
OrderSchema.index({ awb: 1 });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
OrderSchema.index({ isRTO: 1, createdAt: -1 });
OrderSchema.index({ warehouseId: 1, orderStatus: 1 });

// Create model
export const OrderModel = model<IOrderDocument>('Order', OrderSchema);
