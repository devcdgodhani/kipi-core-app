import { encryptObject } from '../../../helpers/encryptionHelper';
import { PAYMENT_GATEWAY, GATEWAY_ENVIRONMENT, PAYMENT_GATEWAY_DEFAULTS } from '../../../constants/payment';
import { ENV_VARIABLE } from '../../../configs/env';
import { paymentGatewayService } from '../../../services/concrete/PaymentGatewayService';
import mongoose from 'mongoose';
import { connectMongoDb } from '../index';

/**
 * Seeds payment gateway configurations
 * Run this seeder to initialize or update payment gateways in the database
 */
export const seedPaymentGateways = async () => {
  try {
    console.log('🌱 Seeding payment gateways...');

    const isProduction = ENV_VARIABLE.NODE_ENV === 'production';
    const currentEnvironment = isProduction ? GATEWAY_ENVIRONMENT.PRODUCTION : GATEWAY_ENVIRONMENT.SANDBOX;

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
      const existing = await paymentGatewayService.findOne({ 
        name: template.name, 
        environment: currentEnvironment 
      } as any);

      const encryptedCredentials = encryptObject(template.credentials);

      if (existing) {
        console.log(`Updating credentials for ${template.displayName} (${currentEnvironment})...`);
        await paymentGatewayService.updateOne(
          { _id: (existing as any)._id } as any,
          { 
            $set: { 
              credentials: encryptedCredentials,
              webhookSecret: template.webhookSecret
            } 
          } as any
        );
      } else {
        console.log(`Creating ${template.displayName} (${currentEnvironment})...`);
        await paymentGatewayService.create({
          name: template.name,
          displayName: template.displayName,
          isEnabled: false,
          environment: currentEnvironment,
          credentials: encryptedCredentials,
          webhookSecret: template.webhookSecret,
          config: {
            timeout: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT,
            retryAttempts: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS
          } as any,
          priority: template.priority
        } as any);
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
