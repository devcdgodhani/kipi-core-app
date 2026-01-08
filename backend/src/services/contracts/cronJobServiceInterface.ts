import { ICronJobAttributes, ICronJobHistoryAttributes, ICronJobDocument } from '../../interfaces/cronJob';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ICronJobService extends IMongooseCommonService<ICronJobAttributes, ICronJobDocument> {
    init(): Promise<void>;
    runJob(identifier: string): Promise<void>;
    getHistory(cronJobId: string): Promise<ICronJobHistoryAttributes[]>;
}
