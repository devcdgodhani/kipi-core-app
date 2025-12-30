import { faker } from '@faker-js/faker';
import { couponService, categoryService, productService } from '../../../services';

export const couponSeeder = async () => {
  try {
    console.log('🌱 Seeding Coupons...');

    const categories = await categoryService.findAll({});
    const products = await productService.findAll({});

    const coupons = [];
    
    // 1. Global Percentage Coupons (15)
    for (let i = 0; i < 15; i++) {
      coupons.push({
        code: `SAVE${faker.datatype.number({ min: 10, max: 50 })}GLOBAL${faker.random.alphaNumeric(3)}`,
        description: 'Global discount on all items',
        discountType: 'PERCENTAGE',
        discountValue: faker.datatype.number({ min: 5, max: 30 }),
        minPurchaseAmount: faker.datatype.number({ min: 0, max: 500 }),
        maxDiscountAmount: faker.datatype.number({ min: 100, max: 1000 }),
        applicability: 'ALL',
        startDate: faker.date.recent(),
        endDate: faker.date.future(),
        isActive: true,
        usageLimit: 1000,
        usedCount: faker.datatype.number({ min: 0, max: 500 })
      });
    }

    // 2. Fixed Amount Coupons (20)
    for (let i = 0; i < 20; i++) {
      coupons.push({
        code: `FLAT${faker.datatype.number({ min: 50, max: 500 })}OFF${faker.random.alphaNumeric(3).toUpperCase()}`,
        description: 'Flat amount off',
        discountType: 'FIXED_AMOUNT',
        discountValue: faker.datatype.number({ min: 50, max: 500 }),
        minPurchaseAmount: 1000, // Usually requires higher spend
        applicability: 'ALL',
        startDate: faker.date.recent(),
        endDate: faker.date.future(),
        isActive: true,
        usageLimit: 500,
        usedCount: faker.datatype.number({ min: 0, max: 100 })
      });
    }

     // 3. Category Specific Coupons (30)
    if (categories.length > 0) {
        for (let i = 0; i < 30; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            coupons.push({
                code: `${cat.slug.substring(0, 4).toUpperCase()}${faker.datatype.number({ min: 10, max: 99 })}${faker.random.alphaNumeric(2).toUpperCase()}`,
                description: `Discount on ${cat.name}`,
                discountType: 'PERCENTAGE',
                discountValue: faker.datatype.number({ min: 10, max: 25 }),
                applicability: 'CATEGORY',
                applicableCategories: [(cat as any)._id],
                startDate: faker.date.recent(),
                endDate: faker.date.future(),
                isActive: true,
                usageLimit: 200
            });
        }
    }

    // 4. Product Specific Coupons (35)
    if (products.length > 0) {
        for (let i = 0; i < 35; i++) {
            const prod = products[Math.floor(Math.random() * products.length)];
            coupons.push({
                code: `PROD${faker.random.alphaNumeric(4).toUpperCase()}${faker.random.alphaNumeric(2).toUpperCase()}`,
                description: `Special offer on ${prod.name}`,
                discountType: 'PERCENTAGE',
                discountValue: faker.datatype.number({ min: 15, max: 40 }),
                applicability: 'PRODUCT',
                applicableProducts: [(prod as any)._id],
                startDate: faker.date.recent(),
                endDate: faker.date.future(),
                isActive: true,
                usageLimit: 50
            });
        }
    }

    // 5. Expired Coupons (Others) (10)
    for (let i = 0; i < 10; i++) {
        coupons.push({
            code: `EXPIRED${faker.datatype.number({ min: 2020, max: 2023 })}${faker.random.alphaNumeric(3).toUpperCase()}`,
            description: 'Old promotion',
            discountType: 'PERCENTAGE',
            discountValue: 50,
            applicability: 'ALL',
            startDate: faker.date.past(2),
            endDate: faker.date.past(1), // Already ended
            isActive: false
        });
    }

    // Insert all
    let count = 0;
    for (const c of coupons) {
        await couponService.create(c as any);
        count++;
    }

    console.log(`✅ Seeded ${count} coupons`);

  } catch (error: any) {
    console.error('❌ Error seeding coupons:', error.message);
  }
};

export const clearCoupons = async () => {
    try {
        console.log('🗑️  Clearing coupons...');
        await couponService.delete({});
        console.log('✅ Coupons cleared');
    } catch (error) {
        console.error('Error clearing coupons:', error);
    }
}
