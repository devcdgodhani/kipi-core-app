import { PaymentGatewayModel } from '../models/paymentGatewayModel';
import { encryptObject } from '../../../helpers/encryptionHelper';

/**
 * Seeds payment gateway configurations
 * Run this seeder to initialize payment gateways in the database
 */
export const seedPaymentGateways = async () => {
  try {
    console.log('Seeding payment gateways...');

    // Check if gateways already exist
    const existingCount = await PaymentGatewayModel.countDocuments();
    if (existingCount > 0) {
      console.log(`Payment gateways already seeded (${existingCount} found). Skipping...`);
      return;
    }

    // Prepare gateway configurations
    const gateways = [
      {
        name: 'phonepe',
        displayName: 'PhonePe',
        isEnabled: false,
        environment: 'sandbox' as const,
        credentials: encryptObject({
          merchantId: process.env.PHONEPE_MERCHANT_ID || '',
          saltKey: process.env.PHONEPE_SALT_KEY || '',
          saltIndex: 1
        }),
        webhookSecret: process.env.PHONEPE_WEBHOOK_SECRET || '',
        config: {
          timeout: 300,
          retryAttempts: 3
        },
        priority: 1
      },
      {
        name: 'razorpay',
        displayName: 'Razorpay',
        isEnabled: false,
        environment: 'sandbox' as const,
        credentials: encryptObject({
          keyId: process.env.RAZORPAY_KEY_ID || '',
          keySecret: process.env.RAZORPAY_KEY_SECRET || ''
        }),
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
        config: {
          timeout: 300,
          retryAttempts: 3
        },
        priority: 2
      },
      {
        name: 'paytm',
        displayName: 'Paytm',
        isEnabled: false,
        environment: 'sandbox' as const,
        credentials: encryptObject({
          merchantId: process.env.PAYTM_MERCHANT_ID || '',
          merchantKey: process.env.PAYTM_MERCHANT_KEY || '',
          website: process.env.PAYTM_WEBSITE || 'WEBSTAGING'
        }),
        webhookSecret: process.env.PAYTM_WEBHOOK_SECRET || '',
        config: {
          timeout: 300,
          retryAttempts: 3
        },
        priority: 3
      }
    ];

    // Insert gateways
    await PaymentGatewayModel.insertMany(gateways);

    console.log('✅ Payment gateways seeded successfully');
    console.log('   - PhonePe (disabled, sandbox)');
    console.log('   - Razorpay (disabled, sandbox)');
    console.log('   - Paytm (disabled, sandbox)');
    console.log('\nNote: Update credentials in admin panel to enable gateways');
  } catch (error) {
    console.error('❌ Error seeding payment gateways:', error);
    throw error;
  }
};

// Allow running this seeder directly
if (require.main === module) {
  const mongoose = require('mongoose');
  const { connectMongoDb } = require('../index');
  
  (async () => {
    try {
      await connectMongoDb({
        connectionUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'kipi-core'
      });
      
      await seedPaymentGateways();
      
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Seeder failed:', error);
      process.exit(1);
    }
  })();
}
