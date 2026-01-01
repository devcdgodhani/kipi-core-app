import { Schema, model } from 'mongoose';
import { IFileStorageDocument } from '../../../interfaces';
import { FILE_TYPE, CLOUD_TYPE, FILE_STORAGE_STATUS } from '../../../constants';
import { PresignedUrlModel } from './presignedUrlModel';
import * as s3Uploader from '../../../helpers/s3Uploader';
import * as cloudinaryUploader from '../../../helpers/cloudinaryUploader';
import { ENV_VARIABLE } from '../../../configs/env';

export const FileStorageSchema = new Schema<IFileStorageDocument>(
  {
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storageFileName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    storageDirPath: {
      type: String,
      required: false,
      trim: true,
    },
    preSignedUrl: {
      type: String,
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
    fileExtension: {
      type: String,
      required: false,
      trim: true,
    },
    fileType: {
      type: String,
      enum: Object.values(FILE_TYPE),
      required: true,
    },
    isInUsed: {
      type: Boolean,
      default: false,
    },
    cloudType: {
      type: String,
      enum: Object.values(CLOUD_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FILE_STORAGE_STATUS),
      default: FILE_STORAGE_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for faster queries
FileStorageSchema.index({ cloudType: 1, status: 1 });
FileStorageSchema.index({ fileType: 1 });
FileStorageSchema.index({ isInUsed: 1 });

// Hook to ensure presigned URL
const ensureUrl = async (doc: any) => {
  if (!doc) return;
  try {
    const fileId = doc._id;
    // Check existing
    const presignedUrlDoc = await PresignedUrlModel.findOne({ fileId }).lean();

    if (presignedUrlDoc) {
      doc.preSignedUrl = presignedUrlDoc.url;
      return;
    }

    // Generate new
    const key = doc.storageDirPath ? `${doc.storageDirPath}/${doc.storageFileName}` : doc.storageFileName;
    const expiryTime = 60 * 60; // 1 hour
    let url = '';

    const isS3 = doc.cloudType === CLOUD_TYPE.AWS_S3 || (!doc.cloudType && ENV_VARIABLE.AWS_ACCESS_KEY_ID);

    if (isS3) {
      url = await s3Uploader.getSignedUrl(key, ENV_VARIABLE.AWS_BUCKET_NAME || '', expiryTime);
    } else {
      url = await cloudinaryUploader.getSignedUrl(key, undefined, expiryTime);
    }

    if (url) {
      doc.preSignedUrl = url;
      // Save to DB
      await PresignedUrlModel.create({
        fileId,
        url,
        expiresAt: new Date(Date.now() + expiryTime * 1000),
      });
    }
  } catch (error) {
    console.error('Error generating presigned url in hook:', error);
  }
};

FileStorageSchema.post(['find', 'findOne'], async function (result, next) {
  if (Array.isArray(result)) {
    await Promise.all(result.map((doc) => ensureUrl(doc)));
  } else {
    await ensureUrl(result);
  }
});

// Create model
export const FileStorageModel = model<IFileStorageDocument>('fileStorages', FileStorageSchema);
