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

  create = async (
    data: Partial<ILotAttributes>,
    options?: any
  ): Promise<ILotAttributes> => {
    // Create the lot first
    const newLot = await super.create(data, options);

    // Create Financial Expense Record for lot amount
    try {
      const { financialRecordService } = await import('./financialRecordService');
      const { EXPENSE_SUBTYPE } = await import('../../constants/financialRecord');
      
      const lotAmount = (data.basePrice || 0) * (data.quantity || 0);
      
      await financialRecordService.createAutomaticExpenseRecord(
        EXPENSE_SUBTYPE.LOT_AMOUNT,
        (newLot as any)._id.toString(),
        lotAmount,
        new Date(),
        'lot'
      );
      console.log(`✅ Financial expense record created for Lot #${data.lotNumber}`);
    } catch (error) {
      console.error(`❌ Failed to create financial record for Lot #${data.lotNumber}:`, error);
      // Don't fail the lot creation if financial record fails
    }

    return newLot;
  };
}
 
export const lotService = new LotService();
