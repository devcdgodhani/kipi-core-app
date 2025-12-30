import mongoose from 'mongoose';
import { connectMongoDb } from '../index';
import userSeeder from './userSeeder';
import { productSeeder } from './productSeeder';

/**
 * Main seeder runner
 */
async function runSeeders() {
  try {
    console.log('🚀 Starting database seeders...\n');

    // Connect to MongoDB
    const mongoConfig = {
      connectionUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      dbName: process.env.MONGODB_DB_NAME || 'express_boilerplate'
    };
    await connectMongoDb(mongoConfig);
    console.log('✅ Connected to MongoDB\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');
    const shouldSeed = args.includes('--seed') || args.length === 0;

    // Clear existing data if requested
    if (shouldClear) {
      console.log('═══════════════════════════════════════');
      console.log('  CLEARING EXISTING DATA');
      console.log('═══════════════════════════════════════\n');
      
      await userSeeder.clearUsers();
      
      // Import clear functions
      const { clearProducts } = await import('./productSeeder');
      const { clearLots } = await import('./lotSeeder');
      // const { clearInventory } = await import('./inventorySeeder'); // Included in product clear usually
      const { clearCoupons } = await import('./couponSeeder');
      const { clearPaymentConfigs } = await import('./paymentConfigSeeder');

      await clearCoupons();
      await clearPaymentConfigs();
      await clearLots();
      await clearProducts(); // Clears products, cats, attrs, skus
      
      console.log('\n✅ Data cleared successfully!\n');
    }

    // Seed data if requested
    if (shouldSeed) {
      console.log('═══════════════════════════════════════');
      console.log('  SEEDING DATABASE');
      console.log('═══════════════════════════════════════\n');
      
      // 1. Users
      await userSeeder.seedUsers();
      
      // 2. Product System (Categories, Attributes, Products, SKUs)
      await productSeeder();

      // Dependencies for subsequent seeders
      const { couponSeeder } = await import('./couponSeeder');
      const { paymentConfigSeeder } = await import('./paymentConfigSeeder');

      // 3. Payment Configs (Needs Categories & Products)
      await paymentConfigSeeder();

      // 4. Coupons (Needs Categories & Products)
      await couponSeeder();
      
      console.log('\n═══════════════════════════════════════');
      console.log('  ✅ SEEDING COMPLETED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════\n');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Seeder failed:', error.message);
    console.error(error.stack);
    
    // Close connection on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run seeders
runSeeders();
