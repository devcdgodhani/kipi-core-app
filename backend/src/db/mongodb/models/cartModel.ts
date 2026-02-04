import { Schema, model } from 'mongoose';
import { ICartDocument } from '../../../interfaces/cart';
import { CART_STATUS } from '../../../constants/cart';

const cartItemSchema = new Schema(
  {
    skuId: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number }, // Snapshot price (optional)
    salePrice: { type: Number },
    offerPrice: { type: Number },
  },
  { _id: false }
);

export const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: Object.values(CART_STATUS), 
      default: CART_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster user cart lookups
CartSchema.index({ userId: 1, status: 1 });

// Pre-save hook to calculate totals (Best effort based on stored prices)
CartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Only calculate based on stored prices if they exist. 
  // Runtime calculation in Controller is preferred for accuracy.
  this.totalPrice = this.items.reduce((sum, item) => {
    const effectivePrice = item.offerPrice || item.salePrice || item.price || 0;
    return sum + (effectivePrice * item.quantity);
  }, 0);
  next();
});

export const CartModel = model<ICartDocument>('Cart', CartSchema);
