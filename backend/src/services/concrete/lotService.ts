import { FilterQuery, UpdateQuery, ClientSession, MongooseUpdateQueryOptions } from 'mongoose';
import { ObjectId } from 'mongoose';
import { ILotAttributes, ILotDocument } from '../../interfaces/lot';
import { LotModel } from '../../db/mongodb/models/lotModel';
import { MongooseCommonService } from './mongooseCommonService';
import { ILotService } from '../contracts/lotServiceInterface';

export class LotService extends MongooseCommonService<ILotAttributes, ILotDocument> implements ILotService {
  constructor() {
    super(LotModel);
  }

  updateOne = async (
    filter: FilterQuery<ILotAttributes>,
    updateData: UpdateQuery<ILotDocument>,
    options: MongooseUpdateQueryOptions<ILotAttributes> & { userId?: ObjectId; session?: ClientSession } = {}
  ): Promise<any> => {
    // Perform the update first
    const result = await this.model.updateOne(filter, updateData, options).exec();

    // Then find the document to recalculate remainingQuantity
    const doc = await this.model.findOne(filter);
    if (doc) {
      const totalAdjusted = (doc.adjustQuantity || []).reduce((acc: number, curr: any) => acc + curr.quantity, 0);
      const newRemaining = doc.quantity - totalAdjusted;
      
      if (doc.remainingQuantity !== newRemaining) {
         doc.remainingQuantity = newRemaining;
         await doc.save();
      }
    }

    return result;
  };
}
