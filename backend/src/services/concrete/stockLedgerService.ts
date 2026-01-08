import { StockLedgerModel } from '../../db/mongodb/models/stockLedgerModel';
import { IStockLedgerAttributes, IStockLedgerDocument, StockLedgerTransactionType, StockLedgerReferenceType } from '../../interfaces/stockLedger';
import { MongooseCommonService } from './mongooseCommonService';
import { IStockLedgerService } from '../contracts/stockLedgerServiceInterface';

export class StockLedgerService extends MongooseCommonService<IStockLedgerAttributes, IStockLedgerDocument> implements IStockLedgerService {
    constructor() {
        super(StockLedgerModel as any);
    }

    async logAdjustment(data: {
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
    }) {
        return this.create(data as any);
    }
}

export const stockLedgerService = new StockLedgerService();
