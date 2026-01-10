import { FileDirectoryModel } from '../../db/mongodb';
import { IFileDirectoryAttributes, IFileDirectoryDocument } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
 
export class FileDirectoryService extends MongooseCommonService<IFileDirectoryAttributes, IFileDirectoryDocument> {
  constructor() {
    super(FileDirectoryModel as any);
  }
}

export const fileDirectoryService = new FileDirectoryService();
