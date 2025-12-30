import { SOURCE_TYPE } from '../constants';
import LotModel from '../db/mongodb/models/lotModel';

export const seedLots = async (skus: any[], suppliers: any[]) => {
  console.log('🌱 Seeding lots...');

  const lots = [];
  
  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i];
    const supplier = suppliers[i % suppliers.length];
    
    // Create 2-3 lots per SKU
    const lotCount = Math.floor(Math.random() * 2) + 2;
    
    for (let j = 0; j < lotCount; j++) {
      const manufacturingDate = new Date();
      manufacturingDate.setDate(manufacturingDate.getDate() - Math.floor(Math.random() * 90));
      
      const expiryDate = new Date(manufacturingDate);
      expiryDate.setDate(expiryDate.getDate() + 365 + Math.floor(Math.random() * 365));
      
      const initialQty = Math.floor(Math.random() * 500) + 100;
      const soldQty = Math.floor(Math.random() * (initialQty * 0.3));
      const damagedQty = Math.floor(Math.random() * 5);
      const reservedQty = Math.floor(Math.random() * 20);
      
      lots.push({
        lotNumber: `LOT-${sku.sku}-${Date.now()}-${j}`,
        sku: sku._id,
        sourceType: SOURCE_TYPE.SUPPLIER,
        supplierId: supplier._id,
        manufacturingDate,
        expiryDate,
        costPerUnit: Math.floor(Math.random() * 500) + 100,
        initialQuantity: initialQty,
        currentQuantity: initialQty - soldQty - damagedQty - reservedQty,
        reservedQuantity: reservedQty,
        soldQuantity: soldQty,
        damagedQuantity: damagedQty,
        purchaseOrderReference: `PO-${Math.floor(Math.random() * 10000)}`,
        qualityCheckStatus: ['PASSED', 'PENDING'][Math.floor(Math.random() * 2)],
        notes: `Batch ${j + 1} for ${sku.sku}`,
      });
    }
  }

  const createdLots = await LotModel.insertMany(lots);
  console.log(`✅ Created ${createdLots.length} lots`);
  
  return createdLots;
};
