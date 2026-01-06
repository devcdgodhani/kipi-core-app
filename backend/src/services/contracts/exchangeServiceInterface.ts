import { IExchangeAttributes, IExchangeDocument } from '../../db/mongodb/models/exchangeModel';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { UpdateWriteOpResult } from 'mongoose';

export interface IExchangeService extends IMongooseCommonService<IExchangeAttributes, IExchangeDocument> {
  requestExchange(data: any): Promise<IExchangeAttributes>;
  updateExchangeStatus(id: string, status: string, adminNotes?: string): Promise<UpdateWriteOpResult | null>;
  cancelExchange(id: string, userId: string): Promise<UpdateWriteOpResult | null>;
}
