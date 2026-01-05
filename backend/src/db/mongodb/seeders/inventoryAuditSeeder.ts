import { InventoryAuditModel } from '../models/inventoryAuditModel';
import { LotModel } from '../models/lotModel';
import { SkuModel } from '../models/skuModel';
import { ADJUST_QUANTITY_TYPE } from '../../../constants';

export const seedInventoryAudit = async () => {
    console.log('🌱 Seeding inventory audit...');
    try {
        const lots = await LotModel.find({});
        if (lots.length === 0) return;

        let count = 0;
        for (const lot of lots) {
            // Check if audit exists
            const exists = await InventoryAuditModel.findOne({ lotId: lot._id });
            if (!exists) {
                // Log the initial creation
                await InventoryAuditModel.create({
                    skuId: (await SkuModel.findOne({ lotId: lot._id }))?._id, // rough link: find SKU that uses this lot
                    transactionType: 'LOT_INWARD',
                    changeQuantity: lot.quantity,
                    previousQuantity: 0,
                    newQuantity: lot.quantity,
                    referenceId: lot._id,
                    referenceType: 'LOT',
                    reason: 'Initial Seed Stock',
                    createdAt: lot.createdAt || new Date()
                });
                count++;
            }
        }
        console.log(`✅ Inventory Audit seeding completed. Created ${count} logs.`);
    } catch (error) {
        console.error('❌ Error seeding inventory audit:', error);
    }
};
