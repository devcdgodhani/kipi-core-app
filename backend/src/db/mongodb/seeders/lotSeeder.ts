import { lotService } from '../../../services/concrete/lotService';
import { skuService } from '../../../services/concrete/skuService';
import { LOT_TYPE, LOT_STATUS } from '../../../constants';

export const seedLots = async () => {
  console.log('🌱 Seeding lots...');
  try {
    const skus = await skuService.findAll({});
    if (skus.length === 0) {
      console.warn('⚠️ No SKUs found. Skipping lot seeding.');
      return;
    }

    for (const sku of skus) {
      const lotNumber = `LOT-${sku.skuCode}-${new Date().getFullYear()}`;
      
      // Upsert Lot
      let lot = await lotService.findOne({ lotNumber });
      if (!lot) {
        lot = await lotService.create({
          lotNumber,
          type: LOT_TYPE.SELF_MANUFACTURE,
          quantity: sku.quantity + 50, // slightly more than SKU stock to show consumption
          remainingQuantity: sku.quantity, // Matches current SKU stock
          basePrice: sku.basePrice,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year expiry
          status: LOT_STATUS.ACTIVE,
          notes: 'Initial seed lot',
        } as any);
        console.log(`+ Created Lot: ${lotNumber}`);

        // Link Lot to SKU
        await skuService.updateOne({ _id: sku._id } as any, { lotId: (lot as any)._id } as any);
      }
    }
    console.log('✅ Lot seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding lots:', error);
  }
};
