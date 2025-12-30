import InventoryModel from '../db/mongodb/models/inventoryModel';

export const seedInventory = async (skus: any[], lots: any[]) => {
  console.log('🌱 Seeding inventory...');

  const inventoryMap = new Map();
  
  // Aggregate lot quantities by SKU
  for (const lot of lots) {
    const skuId = lot.sku.toString();
    if (!inventoryMap.has(skuId)) {
      inventoryMap.set(skuId, {
        totalQuantity: 0,
        reservedQuantity: 0,
      });
    }
    
    const inv = inventoryMap.get(skuId);
    inv.totalQuantity += lot.currentQuantity;
    inv.reservedQuantity += lot.reservedQuantity;
  }
  
  const inventories = [];
  
  for (const sku of skus) {
    const skuId = sku._id.toString();
    const data = inventoryMap.get(skuId) || { totalQuantity: 0, reservedQuantity: 0 };
    
    inventories.push({
      sku: sku._id,
      totalQuantity: data.totalQuantity,
      availableQuantity: data.totalQuantity - data.reservedQuantity,
      reservedQuantity: data.reservedQuantity,
      lowStockThreshold: 50,
      reorderPoint: 100,
      reorderQuantity: 500,
    });
  }

  const createdInventory = await InventoryModel.insertMany(inventories);
  console.log(`✅ Created ${createdInventory.length} inventory records`);
  
  return createdInventory;
};
