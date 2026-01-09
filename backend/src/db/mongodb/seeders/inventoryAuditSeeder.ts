import { stockLedgerService } from '../../../services/concrete/stockLedgerService';
import { lotService } from '../../../services/concrete/lotService';
import { skuService } from '../../../services/concrete/skuService';

export const seedInventoryAudit = async () => {
    console.log('🌱 Seeding inventory audit...');
    try {
        const lots = await lotService.findAll({});
        if (lots.length === 0) return;

        let count = 0;
        for (const lot of lots) {
            // Check if audit exists
            const exists = await stockLedgerService.findOne({ referenceId: (lot as any)._id, referenceType: 'LOT' });
            if (!exists) {
                // Log the initial creation
                const sku = await skuService.findOne({ lotId: (lot as any)._id });
                await stockLedgerService.logAdjustment({
                    skuId: (sku as any)?._id, // rough link: find SKU that uses this lot
                    transactionType: 'LOT_INWARD',
                    changeQuantity: (lot as any).quantity,
                    previousQuantity: 0,
                    newQuantity: (lot as any).quantity,
                    referenceId: (lot as any)._id,
                    referenceType: 'LOT',
                    reason: 'Initial Seed Stock',
                });
                count++;
            }
        }
        console.log(`✅ Inventory Audit seeding completed. Created ${count} logs.`);
    } catch (error) {
        console.error('❌ Error seeding inventory audit:', error);
    }
};
