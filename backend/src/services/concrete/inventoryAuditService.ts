import { InventoryAuditModel, IInventoryAudit } from '../../db/mongodb/models/inventoryAuditModel';
import { MongooseCommonService } from './mongooseCommonService';
import { IInventoryAuditService } from '../contracts/inventoryAuditServiceInterface';

export class InventoryAuditService extends MongooseCommonService<IInventoryAudit, IInventoryAudit> implements IInventoryAuditService {
    constructor() {
        super(InventoryAuditModel as any);
    }

    async logAdjustment(data: {
        skuId?: string;
        productId?: string;
        transactionType: 'ORDER_FULFILLMENT' | 'ORDER_CANCEL' | 'RETURN_RESTOCK' | 'STOCK_ADJUSTMENT' | 'RTO_RESTOCK' | 'ADMIN_ADJUSTMENT' | 'LOT_INWARD';
        changeQuantity: number;
        previousQuantity?: number;
        newQuantity: number;
        referenceId?: string;
        referenceType?: 'ORDER' | 'RETURN' | 'STOCK_ADJUSTMENT' | 'USER' | 'LOT';
        reason?: string;
        userId?: string;
    }) {
        return this.create(data as any);
    }
}

export const inventoryAuditService = new InventoryAuditService();
