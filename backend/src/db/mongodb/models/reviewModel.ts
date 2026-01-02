import { Schema, model } from 'mongoose';
import { IReviewDocument } from '../../../interfaces/review';
import { REVIEW_STATUS } from '../../../constants/review';

export const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxLength: 1000 },
    status: { 
      type: String, 
      enum: Object.values(REVIEW_STATUS), 
      default: REVIEW_STATUS.PENDING 
    },
    isVisible: { type: Boolean, default: true },
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
// Prevent duplicate reviews from same user for same product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const ReviewModel = model<IReviewDocument>('Review', ReviewSchema);
