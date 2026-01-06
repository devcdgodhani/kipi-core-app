import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IStockLedger } from '../../db/mongodb/models/stockLedgerModel';

export interface IStockLedgerService extends IMongooseCommonService<IStockLedger, IStockLedger> {
  logAdjustment(data: {
    skuId?: string;
    productId?: string;
    transactionType: IStockLedger['transactionType'];
    changeQuantity: number;
    previousQuantity?: number;
    newQuantity: number;
    referenceId?: string;
    referenceType?: IStockLedger['referenceType'];
    reason?: string;
    userId?: string;
  }): Promise<any>;
}
