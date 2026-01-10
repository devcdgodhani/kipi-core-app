import { Schema, model } from 'mongoose';
import { IRecentlyViewedDocument } from '../../../interfaces/recentlyViewed';
import { RECENTLY_VIEWED_STATUS } from '../../../constants';

const recentlyViewedSchema = new Schema<IRecentlyViewedDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
    status: { 
      type: String, 
      enum: Object.values(RECENTLY_VIEWED_STATUS), 
      default: RECENTLY_VIEWED_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for user's recent views
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

// Unique constraint: one view record per user-product pair
recentlyViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });

// TTL index: Auto-delete records older than 30 days
recentlyViewedSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const RecentlyViewedModel = model<IRecentlyViewedDocument>('RecentlyViewed', recentlyViewedSchema);
