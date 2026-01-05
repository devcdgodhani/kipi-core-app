import { LotModel } from '../models/lotModel';
import { SkuModel } from '../models/skuModel';
import { LOT_TYPE, LOT_STATUS } from '../../../constants';

export const seedLots = async () => {
  console.log('🌱 Seeding lots...');
  try {
    const skus = await SkuModel.find({}).lean();
    if (skus.length === 0) {
      console.warn('⚠️ No SKUs found. Skipping lot seeding.');
      return;
    }

    for (const sku of skus) {
      const existingLot = await LotModel.findOne({ supplierId: sku.productId }); // Just a check heuristic

      // Check if SKU already has a lot (via some logic, or just check if we created one for this SKU)
      // Since lotId is on SKU, we can check if SKU has lotId.
      if (sku.lotId) continue;

      const lotNumber = `LOT-${sku.skuCode}-${new Date().getFullYear()}`;
      
      // Upsert Lot
      let lot = await LotModel.findOne({ lotNumber });
      if (!lot) {
        lot = await LotModel.create({
          lotNumber,
          type: LOT_TYPE.SELF_MANUFACTURE,
          quantity: sku.quantity + 50, // slightly more than SKU stock to show consumption
          remainingQuantity: sku.quantity, // Matches current SKU stock
          basePrice: sku.basePrice,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year expiry
          status: LOT_STATUS.ACTIVE,
          notes: 'Initial seed lot',
        });
        console.log(`+ Created Lot: ${lotNumber}`);

        // Link Lot to SKU
        await SkuModel.updateOne({ _id: sku._id }, { lotId: lot._id });
      }
    }
    console.log('✅ Lot seeding completed.');
  } catch (error) {
    console.error('❌ Error seeding lots:', error);
  }
};
