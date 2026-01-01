import { ObjectId } from 'mongoose';
import { MEDIA_FILE_TYPE, MEDIA_TYPE, MEDIA_STATUS } from '../constants/media';

export interface IMedia {
  fileType: MEDIA_FILE_TYPE;
  type: MEDIA_TYPE | string;
  fileStorageId?: ObjectId;
  url: string;
  status: MEDIA_STATUS;
  sortOrder?: number;
}
