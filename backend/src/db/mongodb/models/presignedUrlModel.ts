import { Schema, model } from 'mongoose';
import { IPresignedUrlDocument } from '../../../interfaces';

export const PresignedUrlSchema = new Schema<IPresignedUrlDocument>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: 'fileStorages',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL index on expiresAt
PresignedUrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PresignedUrlModel = model<IPresignedUrlDocument>(
  'presignedUrls',
  PresignedUrlSchema
);
