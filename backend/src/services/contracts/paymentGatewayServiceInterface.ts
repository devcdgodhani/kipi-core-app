import { IPaymentGatewayAttributes } from '../../interfaces/paymentGateway';
import { PAYMENT_GATEWAY } from '../../constants/payment';
import { IPaymentGateway } from './paymentGatewayInterface';

/**
 * Payment Gateway Service Contract
 * Interface for managing payment gateway configurations
 */
export interface IPaymentGatewayService {
  /**
   * Get all payment gateways
   */
  getAllGateways(): Promise<IPaymentGatewayAttributes[]>;

  /**
   * Get enabled payment gateways
   */
  getEnabledGateways(): Promise<IPaymentGatewayAttributes[]>;

  /**
   * Get gateway by name
   */
  getGatewayByName(name: PAYMENT_GATEWAY): Promise<IPaymentGatewayAttributes | null>;

  /**
   * Update gateway configuration
   */
  updateGateway(
    name: PAYMENT_GATEWAY,
    updates: Partial<any>
  ): Promise<IPaymentGatewayAttributes | null>;

  /**
   * Toggle gateway enabled status
   */
  toggleGateway(name: PAYMENT_GATEWAY, isEnabled: boolean): Promise<void>;

  /**
   * Get gateway service instance
   */
  getGatewayService(gatewayName: PAYMENT_GATEWAY): Promise<IPaymentGateway>;

  /**
   * Get primary gateway
   */
  getPrimaryGateway(): Promise<IPaymentGatewayAttributes | null>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(
    gatewayName: PAYMENT_GATEWAY,
    payload: any,
    signature: string
  ): Promise<boolean>;
  /**
   * Seed default payment gateways
   */
  seedGateways(): Promise<void>;
}
