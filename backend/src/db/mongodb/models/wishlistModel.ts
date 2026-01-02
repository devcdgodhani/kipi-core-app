import { Schema, model } from 'mongoose';
import { IWishlistDocument } from '../../../interfaces/wishlist';
import { WISHLIST_STATUS } from '../../../constants/wishlist';

const wishlistItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, unique: true, index: true },
    products: [wishlistItemSchema],
    status: { 
      type: String, 
      enum: Object.values(WISHLIST_STATUS), 
      default: WISHLIST_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster user wishlist lookups
WishlistSchema.index({ userId: 1, status: 1 });

export const WishlistModel = model<IWishlistDocument>('Wishlist', WishlistSchema);
