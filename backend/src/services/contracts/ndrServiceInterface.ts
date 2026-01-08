import { INDRAttributes, INDRDocument } from '../../interfaces/ndr';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface INdrService extends IMongooseCommonService<INDRAttributes, INDRDocument> {
  resolveNDR(ndrId: string, resolutionData: {
    resolution: string;
    customerAction?: string;
    rescheduledDate?: Date;
    updatedAddress?: any;
    resolvedBy: string;
  }): Promise<INDRDocument>;
}
