import { faker } from '@faker-js/faker';
import { paymentConfigService, categoryService, productService } from '../../../services';

export const paymentConfigSeeder = async () => {
  try {
    console.log('🌱 Seeding Payment Configs...');

    const categories = await categoryService.findAll({});
    const products = await productService.findAll({});

    let count = 0;

    // 1. Category Level Configs (Randomly restrict COD for some categories)
    for (const cat of categories) {
        // High coverage to reach 100+ total rules
        await paymentConfigService.setPaymentConfig('CATEGORY', (cat as any)._id, {
            isCodAvailable: Math.random() > 0.3, 
            isPrepaidRequired: Math.random() > 0.8,
            minOrderAmountForCod: faker.datatype.number({ min: 100, max: 500 }),
            maxOrderAmountForCod: faker.datatype.number({ min: 5000, max: 20000 })
        } as any);
        count++;
    }

    // 2. Product Level Configs (High value items might need prepayment)
    for (const prod of products) {
        if ((prod as any).basePrice > 3000 || Math.random() > 0.3) {
            await paymentConfigService.setPaymentConfig('PRODUCT', (prod as any)._id, {
                isCodAvailable: Math.random() > 0.4,
                isPrepaidRequired: Math.random() > 0.7,
                description: faker.commerce.productAdjective() + ' item policy'
            } as any);
            count++;
        }
    }

    console.log(`✅ Seeded ${count} payment configuration rules`);

  } catch (error: any) {
    console.error('❌ Error seeding payment configs:', error.message);
  }
};

export const clearPaymentConfigs = async () => {
    try {
        console.log('🗑️  Clearing payment configs...');
        await paymentConfigService.delete({});
        console.log('✅ Payment configs cleared');
    } catch (error) {
        console.error('Error clearing payment configs:', error);
    }
}
