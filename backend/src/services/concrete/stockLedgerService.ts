import { StockLedgerModel, IStockLedger } from '../../db/mongodb/models/stockLedgerModel';
import { MongooseCommonService } from './mongooseCommonService';
import { IStockLedgerService } from '../contracts/stockLedgerServiceInterface';

export class StockLedgerService extends MongooseCommonService<IStockLedger, IStockLedger> implements IStockLedgerService {
    constructor() {
        super(StockLedgerModel as any);
    }

    async logAdjustment(data: {
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
    }) {
        return this.create(data as any);
    }
}

export const stockLedgerService = new StockLedgerService();
