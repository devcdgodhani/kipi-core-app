import { CronJobHistoryModel } from '../../db/mongodb/models/cronJobModel';
import { ICronJobHistoryAttributes, ICronJobHistoryDocument } from '../../interfaces/cronJob';
import { MongooseCommonService } from './mongooseCommonService';

export class CronJobHistoryService
  extends MongooseCommonService<ICronJobHistoryAttributes, ICronJobHistoryDocument>
{
  constructor() {
    super(CronJobHistoryModel as any);
  }
}
