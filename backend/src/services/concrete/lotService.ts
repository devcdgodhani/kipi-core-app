import { FilterQuery, UpdateQuery, ClientSession, MongooseUpdateQueryOptions } from 'mongoose';
import { ObjectId } from 'mongoose';
import { ILotAttributes, ILotDocument } from '../../interfaces/lot';
import { LotModel } from '../../db/mongodb/models/lotModel';
import { MongooseCommonService } from './mongooseCommonService';
import { ILotService } from '../contracts/lotServiceInterface';

export class LotService extends MongooseCommonService<ILotAttributes, ILotDocument> implements ILotService {
  constructor() {
    super(LotModel as any);
  }

  updateOne = async (
    filter: FilterQuery<ILotAttributes>,
    updateData: UpdateQuery<ILotDocument>,
    options: MongooseUpdateQueryOptions<ILotAttributes> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<any> => {
    // Perform the update first
    const result = await this.update(filter as any, updateData as any, options as any);
 
    // Then find the document to recalculate remainingQuantity
    const doc = await this.findOne(filter as any);
    if (doc) {
      const totalAdjusted = ((doc as any).adjustQuantity || []).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
      const newRemaining = (doc as any).quantity - totalAdjusted;
      
      if ((doc as any).remainingQuantity !== newRemaining) {
         await this.update({ _id: (doc as any)._id } as any, { remainingQuantity: newRemaining } as any);
      }
    }
 
    return result;
  };
}
 
export const lotService = new LotService();
