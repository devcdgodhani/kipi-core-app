import mongoose from 'mongoose';
import { seedSuppliers } from './supplierSeeder';
import { seedLots } from './lotSeeder';
import { seedInventory } from './inventorySeeder';
import { seedPaymentConfigs } from './paymentConfigSeeder';
import { seedCoupons } from './couponSeeder';
import CategoryModel from '../db/mongodb/models/categoryModel';
import ProductModel from '../db/mongodb/models/productModel';
import SkuModel from '../db/mongodb/models/skuModel';

export const runAllSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Get existing data
    console.log('📦 Fetching existing data...');
    const categories = await CategoryModel.find({ isDeleted: false }).limit(10);
    const products = await ProductModel.find({ isDeleted: false }).limit(20);
    const skus = await SkuModel.find({ isDeleted: false }).limit(30);

    if (categories.length === 0 || products.length === 0 || skus.length === 0) {
      console.log('⚠️  Warning: No existing categories, products, or SKUs found.');
      console.log('   Please seed categories, products, and SKUs first.');
      return;
    }

    console.log(`✅ Found ${categories.length} categories, ${products.length} products, ${skus.length} SKUs\n`);

    // Seed suppliers (users with type SUPPLIER)
    const suppliers = await seedSuppliers();
    console.log('');

    // Seed lots
    const lots = await seedLots(skus, suppliers);
    console.log('');


    // Seed inventory
    const inventory = await seedInventory(skus, lots);
    console.log('');

    // Seed payment configurations
    const paymentConfigs = await seedPaymentConfigs(categories, products);
    console.log('');

    // Seed coupons
    const coupons = await seedCoupons(categories, products);
    console.log('');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Lots: ${lots.length}`);
    console.log(`   - Inventory: ${inventory.length}`);
    console.log(`   - Payment Configs: ${paymentConfigs.length}`);
    console.log(`   - Coupons: ${coupons.length}`);
    console.log(`   - Total: ${suppliers.length + lots.length + inventory.length + paymentConfigs.length + coupons.length} records\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kipi-core';
  
  mongoose
    .connect(MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB\n');
      await runAllSeeders();
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}
