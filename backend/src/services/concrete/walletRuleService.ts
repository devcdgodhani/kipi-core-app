import { WalletRuleModel } from '../../db/mongodb/models/walletRuleModel';
import { IWalletRuleAttributes, IWalletRuleDocument } from '../../interfaces/walletRule';
import { IWalletRuleService } from '../contracts/walletRuleServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { 
  WALLET_RULE_TYPE, 
  WALLET_RULE_STATUS, 
  WALLET_RULE_VALUE_TYPE,
  WALLET_RULE_ERROR_MESSAGES
} from '../../constants/walletRule';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class WalletRuleService
  extends MongooseCommonService<IWalletRuleAttributes, IWalletRuleDocument>
  implements IWalletRuleService
{
  constructor() {
    super(WalletRuleModel as any);
  }

  /**
   * Get active rules by type
   */
  async getActiveRulesByType(ruleType: WALLET_RULE_TYPE): Promise<IWalletRuleAttributes[]> {
    const now = new Date();
    
    return this.findAll(
      {
        ruleType,
        status: WALLET_RULE_STATUS.ACTIVE,
        $and: [
          { $or: [{ startDate: { $lte: now } }, { startDate: null }, { startDate: { $exists: false } }] },
          { $or: [{ endDate: { $gte: now } }, { endDate: null }, { endDate: { $exists: false } }] }
        ]
      } as any,
      { sort: { priority: -1, createdAt: -1 } }
    );
  }

  /**
   * Get the highest priority active rule for a type
   */
  async getActiveRuleForType(ruleType: WALLET_RULE_TYPE): Promise<IWalletRuleAttributes | null> {
    const rules = await this.getActiveRulesByType(ruleType);
    return rules.length > 0 ? rules[0] : null;
  }

  /**
   * Calculate cashback amount based on order amount
   */
  async calculateCashback(
    orderAmount: number, 
    ruleType: WALLET_RULE_TYPE = WALLET_RULE_TYPE.ORDER_CASHBACK
  ): Promise<{
    cashbackAmount: number;
    appliedRule: IWalletRuleAttributes | null;
    expiryDate: Date | null;
  }> {
    // Get the active rule for this type
    const rule = await this.getActiveRuleForType(ruleType);

    if (!rule) {
      return {
        cashbackAmount: 0,
        appliedRule: null,
        expiryDate: null
      };
    }

    // Check minimum order amount
    if (rule.minOrderAmount && orderAmount < rule.minOrderAmount) {
      return {
        cashbackAmount: 0,
        appliedRule: rule,
        expiryDate: null
      };
    }

    // Calculate cashback based on value type
    let cashbackAmount = 0;
    
    if (rule.valueType === WALLET_RULE_VALUE_TYPE.PERCENTAGE) {
      cashbackAmount = (orderAmount * rule.value) / 100;
    } else if (rule.valueType === WALLET_RULE_VALUE_TYPE.FLAT_AMOUNT) {
      cashbackAmount = rule.value;
    }

    // Apply max cashback limit
    if (rule.maxCashbackAmount && cashbackAmount > rule.maxCashbackAmount) {
      cashbackAmount = rule.maxCashbackAmount;
    }

    // Round to 2 decimal places
    cashbackAmount = Math.round(cashbackAmount * 100) / 100;

    // Calculate expiry date
    let expiryDate: Date | null = null;
    if (rule.expiryDays && rule.expiryDays > 0) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + rule.expiryDays);
    }

    return {
      cashbackAmount,
      appliedRule: rule,
      expiryDate
    };
  }

  /**
   * Activate a rule
   */
  async activateRule(ruleId: string): Promise<IWalletRuleAttributes> {
    const rule = await this.findById(ruleId);

    if (!rule) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_RULE_ERROR_MESSAGES.NOT_FOUND
      );
    }

    const updatedRule = await this.findOneAndUpdate(
      { _id: ruleId },
      { status: WALLET_RULE_STATUS.ACTIVE }
    );

    return updatedRule!;
  }

  /**
   * Deactivate a rule
   */
  async deactivateRule(ruleId: string): Promise<IWalletRuleAttributes> {
    const rule = await this.findById(ruleId);

    if (!rule) {
      throw new ApiError(
        HTTP_STATUS_CODE.NOTFOUND.CODE,
        HTTP_STATUS_CODE.NOTFOUND.STATUS,
        WALLET_RULE_ERROR_MESSAGES.NOT_FOUND
      );
    }

    const updatedRule = await this.findOneAndUpdate(
      { _id: ruleId },
      { status: WALLET_RULE_STATUS.INACTIVE }
    );

    return updatedRule!;
  }

  /**
   * Check and update expired rules
   */
  async updateExpiredRules(): Promise<number> {
    const now = new Date();

    const result = await WalletRuleModel.updateMany(
      {
        status: WALLET_RULE_STATUS.ACTIVE,
        endDate: { $lt: now }
      },
      {
        $set: { status: WALLET_RULE_STATUS.EXPIRED }
      }
    );

    return result.modifiedCount || 0;
  }
}

export const walletRuleService = new WalletRuleService();
