import { ILotAttributes, ILotDocument } from '../../interfaces/lot';
import LotModel from '../../db/mongodb/models/lotModel';
import { MongooseCommonService } from './mongooseCommonService';
import { ILotService } from '../contracts/lotServiceInterface';

export class LotService extends MongooseCommonService<ILotAttributes, ILotDocument> implements ILotService {
  constructor() {
    super(LotModel);
  }

  // Override or add methods as needed
}
