import { ICronJob, ICronJobHistory } from '../../db/mongodb/models/cronJobModel';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ICronJobService extends IMongooseCommonService<ICronJob, ICronJob> {
    init(): Promise<void>;
    runJob(identifier: string): Promise<void>;
    getHistory(cronJobId: string): Promise<ICronJobHistory[]>;
}
