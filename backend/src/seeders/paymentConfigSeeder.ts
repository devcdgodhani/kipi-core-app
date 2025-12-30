import PaymentConfigModel from '../db/mongodb/models/paymentConfigModel';

export const seedPaymentConfigs = async (categories: any[], products: any[]) => {
  console.log('🌱 Seeding payment configurations...');

  const configs = [];
  
  // Category-level configs (for first 3 categories)
  for (let i = 0; i < Math.min(3, categories.length); i++) {
    const category = categories[i];
    
    configs.push({
      entityType: 'CATEGORY',
      entityId: category._id,
      codEnabled: true,
      prepaidEnabled: true,
      codCharges: {
        type: 'FIXED',
        value: 50,
      },
      minOrderValue: 500,
      maxCodAmount: 50000,
    });
  }
  
  // Product-level configs (for first 5 products, override category settings)
  for (let i = 0; i < Math.min(5, products.length); i++) {
    const product = products[i];
    
    configs.push({
      entityType: 'PRODUCT',
      entityId: product._id,
      codEnabled: i % 2 === 0, // Alternate COD availability
      prepaidEnabled: true,
      codCharges: {
        type: 'PERCENTAGE',
        value: 2, // 2% COD charges
      },
      minOrderValue: 1000,
      maxCodAmount: 25000,
    });
  }

  const createdConfigs = await PaymentConfigModel.insertMany(configs);
  console.log(`✅ Created ${createdConfigs.length} payment configurations`);
  
  return createdConfigs;
};
