import { PaymentGatewayModel } from '../models/paymentGatewayModel';
import { encryptObject } from '../../../helpers/encryptionHelper';
import { PAYMENT_GATEWAY, GATEWAY_ENVIRONMENT, PAYMENT_GATEWAY_DEFAULTS } from '../../../constants/payment';
import { ENV_VARIABLE } from '../../../configs/env';

/**
 * Seeds payment gateway configurations
 * Run this seeder to initialize or update payment gateways in the database
 */
export const seedPaymentGateways = async () => {
  try {
    console.log('🌱 Seeding payment gateways...');

    const isProduction = ENV_VARIABLE.NODE_ENV === 'production';
    const currentEnvironment = isProduction ? GATEWAY_ENVIRONMENT.PRODUCTION : GATEWAY_ENVIRONMENT.SANDBOX;

    // Define gateway templates using unified ENV_VARIABLE constants
    // These credentials will be applied to the current environment (Sandbox or Production)
    const gatewayTemplates = [
      {
        name: PAYMENT_GATEWAY.PHONEPE,
        displayName: 'PhonePe',
        priority: 1,
        credentials: {
          clientId: ENV_VARIABLE.PHONEPE_CLIENT_ID || '',
          clientSecret: ENV_VARIABLE.PHONEPE_CLIENT_SECRET || '',
          clientVersion: ENV_VARIABLE.PHONEPE_CLIENT_VERSION || '1'
        },
        webhookSecret: ENV_VARIABLE.PHONEPE_WEBHOOK_SECRET || ''
      },
      {
        name: PAYMENT_GATEWAY.RAZORPAY,
        displayName: 'Razorpay',
        priority: 2,
        credentials: {
          keyId: ENV_VARIABLE.RAZORPAY_KEY_ID || '',
          keySecret: ENV_VARIABLE.RAZORPAY_KEY_SECRET || ''
        },
        webhookSecret: ENV_VARIABLE.RAZORPAY_WEBHOOK_SECRET || ''
      },
      {
        name: PAYMENT_GATEWAY.PAYTM,
        displayName: 'Paytm',
        priority: 3,
        credentials: {
          merchantId: ENV_VARIABLE.PAYTM_MERCHANT_ID || '',
          merchantKey: ENV_VARIABLE.PAYTM_MERCHANT_KEY || '',
          website: ENV_VARIABLE.PAYTM_WEBSITE || 'WEBSTAGING'
        },
        webhookSecret: ENV_VARIABLE.PAYTM_WEBHOOK_SECRET || ''
      }
    ];

    for (const template of gatewayTemplates) {
      // Check if gateway exists for the current environment
      const existing = await PaymentGatewayModel.findOne({ 
        name: template.name, 
        environment: currentEnvironment 
      });

      const encryptedCredentials = encryptObject(template.credentials);

      if (existing) {
        // Update valid credentials and webhook secret
        console.log(`Updating credentials for ${template.displayName} (${currentEnvironment})...`);
        await PaymentGatewayModel.updateOne(
          { _id: existing._id },
          { 
            $set: { 
              credentials: encryptedCredentials,
              webhookSecret: template.webhookSecret
            } 
          }
        );
      } else {
        // Create new entry for this environment
        console.log(`Creating ${template.displayName} (${currentEnvironment})...`);
        await PaymentGatewayModel.create({
          name: template.name,
          displayName: template.displayName,
          isEnabled: false, // Default to disabled to prevent accidental activation
          environment: currentEnvironment,
          credentials: encryptedCredentials,
          webhookSecret: template.webhookSecret,
          config: {
            timeout: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT,
            retryAttempts: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS
          },
          priority: template.priority
        });
      }
    }

    console.log('✅ Payment gateways seeded/updated successfully');
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
        connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL || 'mongodb://localhost:27017',
        dbName: ENV_VARIABLE.MONGO_DB_NAME || 'kipi-core'
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
