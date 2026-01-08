import { PaymentGatewayModel } from '../../db/mongodb/models/paymentGatewayModel';
import { IPaymentGatewayAttributes, IPaymentGatewayDocument } from '../../interfaces/paymentGateway';
import { decryptObject } from '../../helpers/encryptionHelper';
import { PhonePeGatewayService } from './PhonePeGatewayService';
import { RazorpayGatewayService } from './RazorpayGatewayService';
import { PaytmGatewayService } from './PaytmGatewayService';
import { IPaymentGatewayService } from '../contracts/PaymentGatewayInterface';
import { IPaymentGatewayServiceContract } from '../contracts/IPaymentGatewayServiceContract';
import { PAYMENT_GATEWAY, PAYMENT_ERROR_MESSAGES, GATEWAY_ENVIRONMENT } from '../../constants/payment';
import { IPhonePeCredentials, IRazorpayCredentials, IPaytmCredentials } from '../../types/payment';
import { ENV_VARIABLE } from '../../configs/env';
import { seedPaymentGateways } from '../../db/mongodb/seeders/paymentGatewaySeeder';

/**
 * Payment Gateway Service
 * Manages payment gateway configurations and provides gateway instances
 */
export class PaymentGatewayService implements IPaymentGatewayServiceContract {
  /**
   * Get active environment based on NODE_ENV
   */
  private getActiveEnvironment(): string {
    return ENV_VARIABLE.NODE_ENV === 'production' 
      ? GATEWAY_ENVIRONMENT.PRODUCTION 
      : GATEWAY_ENVIRONMENT.SANDBOX;
  }

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
  async getGatewayByName(name: PAYMENT_GATEWAY, environment?: string): Promise<IPaymentGatewayAttributes | null> {
    const targetEnvironment = environment || this.getActiveEnvironment();
    return await PaymentGatewayModel.findOne({ name, environment: targetEnvironment }).lean();
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
    await seedPaymentGateways();
  }
}
