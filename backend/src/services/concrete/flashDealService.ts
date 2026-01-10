import { FlashDealModel } from '../../db/mongodb';
import { IFlashDealAttributes, IFlashDealDocument } from '../../interfaces';
import { IFlashDealService } from '../contracts/flashDealServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class FlashDealService
  extends MongooseCommonService<IFlashDealAttributes, IFlashDealDocument>
  implements IFlashDealService
{
  constructor() {
    super(FlashDealModel as any);
  }
}

export const flashDealService = new FlashDealService();
