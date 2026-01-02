import { Schema, model } from 'mongoose';
import { IReviewDocument } from '../../../interfaces/review';
import { REVIEW_STATUS } from '../../../constants/review';

export const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxLength: 2000 },
    images: [
      { type: Schema.Types.ObjectId, ref: 'FileStorage' }
    ],
    status: { 
      type: String, 
      enum: Object.values(REVIEW_STATUS), 
      default: REVIEW_STATUS.PENDING,
      index: true
    },
    isVisible: { type: Boolean, default: true },
    adminReply: { type: String, maxLength: 2000 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for product reviews
ReviewSchema.index({ productId: 1, status: 1, isVisible: 1 });
// Index for user reviews
ReviewSchema.index({ userId: 1 });
// Prevent duplicate reviews from same user for same product in same order
ReviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

export const ReviewModel = model<IReviewDocument>('Review', ReviewSchema);
