import { seedCategories } from './categorySeeder';
import { seedAttributes } from './attributeSeeder';
import { seedUsers } from './userSeeder';
import { seedProducts } from './productSeeder';
import { seedLots } from './lotSeeder';
import { seedCoupons } from './couponSeeder';
import { seedOrders } from './orderSeeder';
import { seedReviews } from './reviewSeeder';
import { seedReturns } from './returnSeeder';
import { seedWishlist } from './wishlistSeeder';
import { seedCart } from './cartSeeder';
import { seedLoyalty } from './loyaltySeeder';
import { seedInventoryAudit } from './inventoryAuditSeeder';
import { seedCouriers } from './courierSeeder';

export const runSeeders = async () => {
  try {
    console.log('🚀 Starting Seeding Process...');
    
    // Level 1: Foundation (Categories, Attributes, Users, Couriers)
    await seedCategories();
    await seedAttributes();
    await seedUsers();
    await seedCouriers();
    
    // Level 2: Inventory & Catalog (Products -> SKUs -> Lots)
    await seedProducts();
    await seedLots();
    
    // Level 3: Rules & Ops (Coupons)
    await seedCoupons();
    
    // Level 4: Transactions (Orders -> Reviews, Returns)
    await seedOrders();
    await seedReviews();
    await seedReturns();

    // Level 5: User Engagement & Audit
    await seedWishlist();
    await seedCart();
    await seedLoyalty();
    await seedInventoryAudit();
    
    console.log('✅ All seeders executed successfully.');
  } catch (error) {
    console.error('Error running seeders:', error);
  }
};
