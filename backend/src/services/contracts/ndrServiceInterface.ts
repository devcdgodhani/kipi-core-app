import { INDR } from '../../db/mongodb/models/ndrModel';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface INdrService extends IMongooseCommonService<any, INDR> {
  resolveNDR(ndrId: string, resolutionData: {
    resolution: string;
    customerAction?: string;
    rescheduledDate?: Date;
    updatedAddress?: any;
    resolvedBy: string;
  }): Promise<INDR>;
}
