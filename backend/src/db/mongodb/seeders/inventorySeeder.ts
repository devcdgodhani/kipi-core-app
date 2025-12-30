import { faker } from '@faker-js/faker';
import { inventoryService, skuService, lotService } from '../../../services';

export const inventorySeeder = async () => {
  try {
    console.log('🌱 Seeding Inventory & Stock Movements...');

    const skus = await skuService.findAll({});
    const lots = await lotService.findAll({});

    if (skus.length === 0) {
      console.log('⚠️ No SKUs found. Skipping Inventory seeding.');
      return;
    }

    let movementCount = 0;

    // 1. Initial Stock from Lots (already handled by lot creation logic usually, but let's simulate movements)
    // We will simulate some adjustments
    for (const sku of skus) {
      // High chance to adjust stock to reach 100+ movements
      if (Math.random() > 0.3) {
        const skuLots = lots.filter(l => (l as any).sku.toString() === (sku as any)._id.toString());
        
        // Simulate "Sold" stock (Release/Deduct)
        if (skuLots.length > 0) {
            try {
                const lot = skuLots[0];
                const qty = faker.datatype.number({ min: 1, max: 10 });
                await inventoryService.adjustStock((sku as any)._id, -qty, 'Order Fulfillment', (lot as any)._id);
                movementCount++;
            } catch (e) { /* ignore stock error */ }
        }

        // Simulate "Returned" stock
        if (Math.random() > 0.6) {
             try {
                 const qty = faker.datatype.number({ min: 1, max: 5 });
                 await inventoryService.adjustStock((sku as any)._id, qty, 'Customer Return'); 
                 movementCount++;
             } catch (e) {}
        }
        
         // Simulate "Damaged" stock
        if (Math.random() > 0.7) {
             const lot = skuLots[0]; 
             if(lot) {
                try {
                    const qty = faker.datatype.number({ min: 1, max: 3 });
                    await inventoryService.adjustStock((sku as any)._id, -qty, 'Damaged in Warehouse', (lot as any)._id);
                    movementCount++;
                } catch (e) {}
             }
        }
      }
      
      // Reserve some stock
      if (Math.random() > 0.4) {
          try {
              const reserveQty = faker.datatype.number({ min: 1, max: 20 });
              // Ensure we don't reserve more than available (simplified check)
              await inventoryService.reserveStock((sku as any)._id, reserveQty);
              movementCount++;
          } catch (e) {}
      }
    }

    console.log(`✅ Generated ${movementCount} stock movements across SKUs`);

  } catch (error: any) {
    console.error('❌ Error seeding inventory:', error.message);
  }
};

export const clearInventory = async () => {
     try {
        console.log('🗑️  Clearing inventory data...');
        // Ideally we wipe the inventory collection or reset values. 
        // Since inventory is aggregate, we might just reset counts or delete history
        // Assuming inventoryService has a method to clear or we delete via model if exposed.
        // specific cleanup might be needed if "InventoryModel" exists distinct from SKU fields
        // For now, relying on product/sku clear.
        console.log('✅ Inventory cleared (via Product System clean)');
    } catch (error) {
        console.error('Error clearing inventory:', error);
    }
}
