import { NDRModel } from '../../db/mongodb';
import { INDRAttributes, INDRDocument } from '../../interfaces/ndr';
import { INdrService } from '../contracts/ndrServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { Types } from 'mongoose';

export class NdrService 
  extends MongooseCommonService<INDRAttributes, INDRDocument> 
  implements INdrService 
{
  constructor() {
    super(NDRModel);
  }

  async resolveNDR(ndrId: string, resolutionData: any): Promise<INDRDocument> {
    const ndr = await this.findById(ndrId);
    if (!ndr) throw new Error('NDR record not found');

    const updateData: any = {
      resolution: resolutionData.resolution,
      customerAction: resolutionData.customerAction,
      rescheduledDate: resolutionData.rescheduledDate,
      updatedAddress: resolutionData.updatedAddress,
      resolvedDate: new Date(),
      resolvedBy: new Types.ObjectId(resolutionData.resolvedBy),
      status: 'RESOLVED'
    };

    return (await this.upsert({ _id: new Types.ObjectId(ndrId) } as any, updateData)) as INDRDocument;
  }
}
 
export const ndrService = new NdrService();
