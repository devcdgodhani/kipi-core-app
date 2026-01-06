import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IInventoryAudit } from '../../db/mongodb/models/inventoryAuditModel';
import { Document } from 'mongoose';

export interface IInventoryAuditService extends IMongooseCommonService<IInventoryAudit, IInventoryAudit> {
  logAdjustment(data: {
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
  }): Promise<any>;
}
