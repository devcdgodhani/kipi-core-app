import { Schema, model, Document } from 'mongoose';
import { IOrder } from '../../../types/order';
interface IOrderDocument extends IOrder, Document {}

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
  userId: { type: String, ref: 'User', required: true }, // Using string ID as User ID is string in some places or ObjectId? Usually ObjectId. But types say string.
  // Wait, in controller it was req.user._id. In User model it's usually ObjectId.
  // Let's us Schema.Types.ObjectId if referencing.
  // But define as String in type. Mongoose handles cast.
  // Let's look at CartModel or generic.
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
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  notes: { type: String }
}, {
  timestamps: true,
  versionKey: false
});

// Create model
export const OrderModel = model<IOrderDocument>('Order', OrderSchema);
