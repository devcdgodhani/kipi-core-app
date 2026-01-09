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
import { MongooseCommonService } from './mongooseCommonService';
 
/**
 * Payment Gateway Service
 * Manages payment gateway configurations and provides gateway instances
 */
export class PaymentGatewayService extends MongooseCommonService<IPaymentGatewayAttributes, IPaymentGatewayDocument> implements IPaymentGatewayServiceContract {
  constructor() {
    super(PaymentGatewayModel as any);
  }
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
    return await this.findAll({}, { sort: { priority: 1 } });
  }

  /**
   * Get enabled payment gateways
   */
  async getEnabledGateways(): Promise<IPaymentGatewayAttributes[]> {
    return await this.findAll({ isEnabled: true } as any, { sort: { priority: 1 } });
  }

  /**
   * Get gateway by name
   */
  async getGatewayByName(name: PAYMENT_GATEWAY, environment?: string): Promise<IPaymentGatewayAttributes | null> {
    const targetEnvironment = environment || this.getActiveEnvironment();
    return await this.findOne({ name, environment: targetEnvironment } as any);
  }

  /**
   * Create new gateway configuration
   */
  async createGateway(payload: Partial<IPaymentGatewayAttributes>): Promise<IPaymentGatewayAttributes> {
    return await this.create(payload as any);
  }

  /**
   * Update gateway configuration
   */
  async updateGateway(
    name: PAYMENT_GATEWAY,
    updates: Partial<IPaymentGatewayAttributes>
  ): Promise<IPaymentGatewayAttributes | null> {
    return await this.findOneAndUpdate(
      { name } as any,
      { $set: updates } as any,
      { new: true }
    );
  }

  /**
   * Toggle gateway enabled status
   */
  async toggleGateway(name: PAYMENT_GATEWAY, isEnabled: boolean): Promise<void> {
    await this.updateOne({ name } as any, { $set: { isEnabled } } as any);
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
    return await this.findOne({ isEnabled: true } as any, { sort: { priority: 1 } });
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
 
export const paymentGatewayService = new PaymentGatewayService();
