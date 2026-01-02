import { InventoryAuditModel, IInventoryAudit } from '../../db/mongodb/models/inventoryAuditModel';
import { MongooseCommonService } from './mongooseCommonService';

export class InventoryAuditService extends MongooseCommonService<IInventoryAudit, IInventoryAudit> {
    constructor() {
        super(InventoryAuditModel);
    }

    async logAdjustment(data: {
        skuId: string;
        transactionType: IInventoryAudit['transactionType'];
        changeQuantity: number;
        previousQuantity: number;
        newQuantity: number;
        referenceId?: string;
        referenceType?: IInventoryAudit['referenceType'];
        reason?: string;
    }) {
        return this.create(data as any);
    }
}

export const inventoryAuditService = new InventoryAuditService();
