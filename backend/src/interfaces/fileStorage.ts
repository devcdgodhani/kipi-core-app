import { Document, ObjectId } from 'mongoose';
import { FILE_TYPE, CLOUD_TYPE, FILE_STORAGE_STATUS } from '../constants';
import { IDefaultAttributes } from './common';


export interface IFileStorageAttributes extends IDefaultAttributes {
  _id: ObjectId;
  originalFileName: string;
  storageFileName: string;
  storageDirPath?: string;
  preSignedUrl?: string;
  fileSize?: number;
  fileExtension?: string;
  fileType: FILE_TYPE;
  isInUsed: boolean;
  cloudType: CLOUD_TYPE;
  status: FILE_STORAGE_STATUS;
}

export interface IFileStorageDocument extends Omit<IFileStorageAttributes, '_id'>, Document {}
