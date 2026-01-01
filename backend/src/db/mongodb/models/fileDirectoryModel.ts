import { Schema, model } from 'mongoose';
import { IFileDirectoryDocument } from '../../../interfaces';

export const FileDirectorySchema = new Schema<IFileDirectoryDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parentPath: {
      type: String,
      default: null,
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
FileDirectorySchema.index({ parentPath: 1 });

export const FileDirectoryModel = model<IFileDirectoryDocument>('FileDirectory', FileDirectorySchema);
