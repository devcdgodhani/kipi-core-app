import { seedCategories } from './categorySeeder';
import { seedAttributes } from './attributeSeeder';
import { seedUsers } from './userSeeder';
import { seedProducts } from './productSeeder';
import { seedLots } from './lotSeeder';
import { seedCoupons } from './couponSeeder';
import { seedOrders } from './orderSeeder';
import { seedReviews } from './reviewSeeder';
import { seedReturns } from './returnSeeder';

export const runSeeders = async () => {
  try {
    console.log('🚀 Starting Seeding Process...');
    
    // Level 1: Foundation (Categories, Attributes, Users)
    await seedCategories();
    await seedAttributes();
    await seedUsers();
    
    // Level 2: Inventory & Catalog (Products -> SKUs -> Lots)
    await seedProducts();
    await seedLots();
    
    // Level 3: Rules & Ops (Coupons)
    await seedCoupons();
    
    // Level 4: Transactions (Orders -> Reviews, Returns)
    await seedOrders();
    await seedReviews();
    await seedReturns();
    
    console.log('✅ All seeders executed successfully.');
  } catch (error) {
    console.error('Error running seeders:', error);
  }
};
