import { seedCategories } from './categorySeeder';
import { seedAttributes } from './attributeSeeder';
import { seedUsers } from './userSeeder';
import { seedProducts } from './productSeeder';
import { seedLots } from './lotSeeder';
import { seedCoupons } from './couponSeeder';
import { seedOrders } from './orderSeeder';
import { seedShipments } from './shipmentSeeder';
import { seedRTOs } from './rtoSeeder';
import { seedReviews } from './reviewSeeder';
import { seedReturns } from './returnSeeder';
import { seedWishlist } from './wishlistSeeder';
import { seedCart } from './cartSeeder';
// import { seedLoyalty } from './loyaltySeeder';
import { seedInventoryAudit } from './inventoryAuditSeeder';
import { seedCouriers } from './courierSeeder';
import { seedPaymentGateways } from './paymentGatewaySeeder';
import { seedWalletRules } from './walletRuleSeeder';
import { seedCustomerAppSettings } from './customerAppSettingsSeeder';

export const runSeeders = async () => {
  try {
    console.log('🚀 Starting Seeding Process...');
    
    // Level 1: Foundation (Categories, Attributes, Users, Couriers)
    await seedCategories();
    await seedAttributes();
    await seedUsers();
    await seedCouriers();
    await seedPaymentGateways();
    await seedCustomerAppSettings();
    
    // Level 2: Inventory & Catalog (Products -> SKUs -> Lots)
    await seedProducts();
    await seedLots();
    
    // Level 3: Rules & Ops (Coupons, Wallet Rules)
    await seedCoupons();
    await seedWalletRules();
    
    // Level 4: Transactions (Orders -> Reviews, Returns)
    await seedOrders();
    await seedShipments();
    await seedRTOs();
    await seedReviews();
    await seedReturns();

    // Level 5: User Engagement & Audit
    await seedWishlist();
    await seedCart();
    // await seedLoyalty();
    await seedInventoryAudit();
    
    console.log('✅ All seeders executed successfully.');
  } catch (error) {
    console.error('Error running seeders:', error);
  }
};
