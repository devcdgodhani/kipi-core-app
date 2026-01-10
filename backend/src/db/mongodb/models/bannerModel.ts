import { Schema, model } from 'mongoose';
import { IBannerDocument } from '../../../interfaces/banner';
import { BANNER_STATUS, BANNER_LINK_TYPE, BANNER_TARGET_AUDIENCE } from '../../../constants';

const bannerSchema = new Schema<IBannerDocument>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageId: { type: Schema.Types.ObjectId, ref: 'FileStorage', required: true },
    mobileImageId: { type: Schema.Types.ObjectId, ref: 'FileStorage' },
    linkType: { 
      type: String, 
      enum: Object.values(BANNER_LINK_TYPE), 
      default: BANNER_LINK_TYPE.NONE 
    },
    linkValue: { type: String },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    targetAudience: { 
      type: String, 
      enum: Object.values(BANNER_TARGET_AUDIENCE), 
      default: BANNER_TARGET_AUDIENCE.ALL 
    },
    status: { 
      type: String, 
      enum: Object.values(BANNER_STATUS), 
      default: BANNER_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
bannerSchema.index({ status: 1, isActive: 1, startDate: 1, endDate: 1 });
bannerSchema.index({ displayOrder: 1 });
bannerSchema.index({ targetAudience: 1 });

export const BannerModel = model<IBannerDocument>('Banner', bannerSchema);
