import { faker } from '@faker-js/faker';
import { lotService, skuService, userService } from '../../../services';
import { Types } from 'mongoose';
import { USER_TYPE } from '../../../constants';

export const lotSeeder = async () => {
  try {
    console.log('🌱 Seeding Lots...');

    // 1. Get Dependencies
    const skus = await skuService.findAll({});
    const suppliers = await userService.findAll({ type: USER_TYPE.SUPPLIER });

    if (skus.length === 0) {
      console.log('⚠️ No SKUs found. Skipping Lot seeding.');
      return;
    }

    if (suppliers.length === 0) {
      console.log('⚠️ No Suppliers found. Skipping Lot seeding.');
      return;
    }

    const lots = [];
    // Target ~200 lots
    const lotsPerSku = Math.ceil(200 / skus.length);

    for (const sku of skus) {
      for (let i = 0; i < Math.max(1, lotsPerSku); i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const mfgDate = faker.date.past(1);
        const expiryDate = faker.date.future(2, mfgDate);
        
        lots.push({
          sku: (sku as any)._id,
          lotNumber: `BATCH-${faker.random.alphaNumeric(8).toUpperCase()}`,
          currentQuantity: faker.datatype.number({ min: 10, max: 500 }),
          initialQuantity: faker.datatype.number({ min: 100, max: 500 }),
          costPerUnit: faker.datatype.number({ min: 5, max: 200 }),
          manufacturingDate: mfgDate,
          expiryDate: expiryDate,
          supplierId: (supplier as any)._id,
          sourceType: 'SUPPLIER',
          notes: faker.lorem.sentence(),
          isActive: true
        });
      }
    }

    // Bulk create is not available in service, so we loop create or use model directly if accessible.
    // Using service.create for validation logic
    let createdCount = 0;
    for (const lotData of lots) {
       // Adjust quantity to be <= initialQuantity logic if needed, but faker logic above handles it roughly
       if (lotData.currentQuantity > lotData.initialQuantity) {
           lotData.currentQuantity = lotData.initialQuantity;
       }
       await lotService.create(lotData as any);
       createdCount++;
    }

    console.log(`✅ Seeded ${createdCount} lots across ${skus.length} SKUs`);

  } catch (error: any) {
    console.error('❌ Error seeding lots:', error.message);
  }
};

export const clearLots = async () => {
    try {
        console.log('🗑️  Clearing lots...');
        await lotService.delete({});
        console.log('✅ Lots cleared');
    } catch (error) {
        console.error('Error clearing lots:', error);
    }
}
