import { IWalletRuleAttributes, IWalletRuleDocument } from '../../interfaces/walletRule';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { WALLET_RULE_TYPE, WALLET_RULE_STATUS } from '../../constants/walletRule';

export interface IWalletRuleService extends IMongooseCommonService<IWalletRuleAttributes, IWalletRuleDocument> {
  /**
   * Get active rules by type
   */
  getActiveRulesByType(ruleType: WALLET_RULE_TYPE): Promise<IWalletRuleAttributes[]>;

  /**
   * Get the highest priority active rule for a type
   */
  getActiveRuleForType(ruleType: WALLET_RULE_TYPE): Promise<IWalletRuleAttributes | null>;

  /**
   * Calculate cashback amount based on order amount
   */
  calculateCashback(orderAmount: number, ruleType?: WALLET_RULE_TYPE): Promise<{
    cashbackAmount: number;
    appliedRule: IWalletRuleAttributes | null;
    expiryDate: Date | null;
  }>;

  /**
   * Activate a rule
   */
  activateRule(ruleId: string): Promise<IWalletRuleAttributes>;

  /**
   * Deactivate a rule
   */
  deactivateRule(ruleId: string): Promise<IWalletRuleAttributes>;

  /**
   * Check and update expired rules
   */
  updateExpiredRules(): Promise<number>;
}
