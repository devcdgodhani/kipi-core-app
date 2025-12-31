import { ILotAttributes, ILotDocument } from '../../interfaces/lot';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ILotService extends IMongooseCommonService<ILotAttributes, ILotDocument> {
  // Add any lot specific methods here if needed
}
