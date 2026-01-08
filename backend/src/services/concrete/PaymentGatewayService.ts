import { PaymentGatewayModel } from '../../db/mongodb/models/paymentGatewayModel';
import { IPaymentGatewayAttributes, IPaymentGatewayDocument } from '../../interfaces/paymentGateway';
import { decryptObject } from '../../helpers/encryptionHelper';
import { PhonePeGatewayService } from './PhonePeGatewayService';
import { RazorpayGatewayService } from './RazorpayGatewayService';
import { PaytmGatewayService } from './PaytmGatewayService';
import { IPaymentGatewayService } from '../contracts/PaymentGatewayInterface';
import { IPaymentGatewayServiceContract } from '../contracts/IPaymentGatewayServiceContract';
import { PAYMENT_GATEWAY, PAYMENT_ERROR_MESSAGES } from '../../constants/payment';
import { IPhonePeCredentials, IRazorpayCredentials, IPaytmCredentials } from '../../types/payment';

/**
 * Payment Gateway Service
 * Manages payment gateway configurations and provides gateway instances
 */
export class PaymentGatewayService implements IPaymentGatewayServiceContract {
  /**
   * Get all payment gateways
   */
  async getAllGateways(): Promise<IPaymentGatewayAttributes[]> {
    return await PaymentGatewayModel.find({}).sort({ priority: 1 }).lean();
  }

  /**
   * Get enabled payment gateways
   */
  async getEnabledGateways(): Promise<IPaymentGatewayAttributes[]> {
    return await PaymentGatewayModel.find({ isEnabled: true })
      .sort({ priority: 1 })
      .lean();
  }

  /**
   * Get gateway by name
   */
  async getGatewayByName(name: PAYMENT_GATEWAY): Promise<IPaymentGatewayAttributes | null> {
    return await PaymentGatewayModel.findOne({ name }).lean();
  }

  /**
   * Create new gateway configuration
   */
  async createGateway(payload: Partial<IPaymentGatewayAttributes>): Promise<IPaymentGatewayAttributes> {
    const gateway = new PaymentGatewayModel(payload);
    const saved = await gateway.save();
    return saved.toObject();
  }

  /**
   * Update gateway configuration
   */
  async updateGateway(
    name: PAYMENT_GATEWAY,
    updates: Partial<IPaymentGatewayAttributes>
  ): Promise<IPaymentGatewayAttributes | null> {
    return await PaymentGatewayModel.findOneAndUpdate(
      { name },
      { $set: updates },
      { new: true }
    ).lean();
  }

  /**
   * Toggle gateway enabled status
   */
  async toggleGateway(name: PAYMENT_GATEWAY, isEnabled: boolean): Promise<void> {
    await PaymentGatewayModel.updateOne({ name }, { $set: { isEnabled } });
  }

  /**
   * Get gateway service instance
   */
  async getGatewayService(gatewayName: PAYMENT_GATEWAY): Promise<IPaymentGatewayService> {
    const gateway = await this.getGatewayByName(gatewayName);

    if (!gateway) {
      throw new Error(PAYMENT_ERROR_MESSAGES.GATEWAY_NOT_FOUND);
    }

    if (!gateway.isEnabled) {
      throw new Error(PAYMENT_ERROR_MESSAGES.GATEWAY_DISABLED);
    }

    // Decrypt credentials
    const credentials = decryptObject(gateway.credentials);

    // Create gateway service instance based on gateway type
    switch (gatewayName) {
      case PAYMENT_GATEWAY.PHONEPE:
        return new PhonePeGatewayService(
          credentials as IPhonePeCredentials,
          gateway.webhookSecret,
          gateway.environment
        );

      case PAYMENT_GATEWAY.RAZORPAY:
        return new RazorpayGatewayService(
          credentials as IRazorpayCredentials,
          gateway.webhookSecret
        );

      case PAYMENT_GATEWAY.PAYTM:
        return new PaytmGatewayService(
          credentials as IPaytmCredentials,
          gateway.webhookSecret,
          gateway.environment
        );

      default:
        throw new Error(`Unsupported gateway: ${gatewayName}`);
    }
  }

  /**
   * Get primary gateway (highest priority enabled gateway)
   */
  async getPrimaryGateway(): Promise<IPaymentGatewayAttributes | null> {
    return await PaymentGatewayModel.findOne({ isEnabled: true })
      .sort({ priority: 1 })
      .lean();
  }

  /**
   * Verify webhook signature for a gateway
   */
  async verifyWebhook(
    gatewayName: PAYMENT_GATEWAY,
    payload: any,
    signature: string
  ): Promise<boolean> {
    try {
      const gatewayService = await this.getGatewayService(gatewayName);
      return gatewayService.verifyWebhookSignature(payload, signature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Seed default payment gateways
   */
  async seedGateways(): Promise<void> {
    try {
      console.log('🌱 Seeding payment gateways...');
      const { ENV_VARIABLE } = await import('../../configs');
      const { encryptObject } = await import('../../helpers/encryptionHelper');
      const { PAYMENT_GATEWAY_DEFAULTS, GATEWAY_ENVIRONMENT } = await import('../../constants/payment');

      const gateways = [
        {
          name: PAYMENT_GATEWAY.RAZORPAY,
          displayName: 'Razorpay',
          isEnabled: false,
          environment: GATEWAY_ENVIRONMENT.SANDBOX,
          credentials: {
            keyId: ENV_VARIABLE.RAZORPAY_KEY_ID || '',
            keySecret: ENV_VARIABLE.RAZORPAY_KEY_SECRET || ''
          },
          webhookSecret: ENV_VARIABLE.RAZORPAY_WEBHOOK_SECRET,
          config: {
              timeout: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT,
              retryAttempts: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS
          },
          priority: 1
        },
        {
          name: PAYMENT_GATEWAY.PHONEPE,
          displayName: 'PhonePe',
          isEnabled: false,
          environment: GATEWAY_ENVIRONMENT.SANDBOX,
          credentials: {
            merchantId: ENV_VARIABLE.PHONEPE_MERCHANT_ID || '',
            saltKey: ENV_VARIABLE.PHONEPE_SALT_KEY || '',
            saltIndex: ENV_VARIABLE.PHONEPE_SALT_INDEX || '1'
          },
          webhookSecret: ENV_VARIABLE.PHONEPE_WEBHOOK_SECRET,
          config: {
              timeout: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT,
              retryAttempts: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS
          },
          priority: 2
        },
        {
          name: PAYMENT_GATEWAY.PAYTM,
          displayName: 'Paytm',
          isEnabled: false,
          environment: GATEWAY_ENVIRONMENT.SANDBOX,
          credentials: {
            merchantId: ENV_VARIABLE.PAYTM_MERCHANT_ID || '',
            merchantKey: ENV_VARIABLE.PAYTM_MERCHANT_KEY || '',
            website: ENV_VARIABLE.PAYTM_WEBSITE || 'WEBSTAGING'
          },
          webhookSecret: ENV_VARIABLE.PAYTM_WEBHOOK_SECRET,
          config: {
              timeout: PAYMENT_GATEWAY_DEFAULTS.TIMEOUT,
              retryAttempts: PAYMENT_GATEWAY_DEFAULTS.RETRY_ATTEMPTS
          },
          priority: 3
        }
      ];

      for (const gateway of gateways) {
        const existing = await PaymentGatewayModel.findOne({ name: gateway.name });
        
        if (!existing) {
          // Encrypt credentials before saving
          const encryptedCredentials = encryptObject(gateway.credentials);
          
          await PaymentGatewayModel.create({
            ...gateway,
            credentials: encryptedCredentials
          });
          console.log(`✅ Seeded ${gateway.displayName} gateway`);
        }
      }
      console.log('✅ Payment gateway seeding completed');
    } catch (error) {
      console.error('❌ Error seeding payment gateways:', error);
    }
  }
}
