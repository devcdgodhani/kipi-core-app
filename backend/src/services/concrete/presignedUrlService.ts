import { PresignedUrlModel } from '../../db/mongodb';
import { IPresignedUrlAttributes, IPresignedUrlDocument } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
 
export class PresignedUrlService extends MongooseCommonService<IPresignedUrlAttributes, IPresignedUrlDocument> {
  constructor() {
    super(PresignedUrlModel as any);
  }
}
