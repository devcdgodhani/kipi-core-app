import { IStockLedgerAttributes, IStockLedgerDocument, StockLedgerTransactionType, StockLedgerReferenceType } from '../../interfaces/stockLedger';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IStockLedgerService extends IMongooseCommonService<IStockLedgerAttributes, IStockLedgerDocument> {
  logAdjustment(data: {
    skuId?: string;
    productId?: string;
    transactionType: StockLedgerTransactionType;
    changeQuantity: number;
    previousQuantity?: number;
    newQuantity: number;
    referenceId?: string;
    referenceType?: StockLedgerReferenceType;
    reason?: string;
    userId?: string;
  }): Promise<any>;
}
