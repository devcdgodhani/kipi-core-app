import { Schema, model } from 'mongoose';
import { ICoupon } from '../../../interfaces';
import { DISCOUNT_TYPE, COUPON_APPLICABILITY } from '../../../constants';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    applicability: {
      type: String,
      enum: Object.values(COUPON_APPLICABILITY),
      required: true,
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    minCartValue: {
      type: Number,
      min: 0,
    },
    maxDiscountCap: {
      type: Number,
      min: 0,
    },
    userSegments: [String],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    festivalEvent: {
      type: String,
      trim: true,
    },
    dayTimeRestrictions: {
      days: [String],
      startTime: String,
      endTime: String,
    },
    totalUsageLimit: {
      type: Number,
      min: 0,
    },
    perUserUsageLimit: {
      type: Number,
      min: 0,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    canStackWithOthers: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoApply: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.plugin(softDeletePlugin);

// Index for efficient queries
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const CouponModel = model<ICoupon>('Coupon', couponSchema);

export default CouponModel;
