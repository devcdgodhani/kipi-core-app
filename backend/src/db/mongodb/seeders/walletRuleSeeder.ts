import { WalletRuleModel } from '../models/walletRuleModel';
import { WALLET_RULE_TYPE, WALLET_RULE_STATUS, WALLET_RULE_VALUE_TYPE } from '../../../constants/walletRule';

export const seedWalletRules = async () => {
  const rules = [
    {
      name: 'Welcome Sign-up Bonus',
      description: 'Get $50 when you sign up!',
      ruleType: WALLET_RULE_TYPE.SIGNUP_BONUS,
      valueType: WALLET_RULE_VALUE_TYPE.FLAT_AMOUNT,
      value: 50,
      status: WALLET_RULE_STATUS.ACTIVE,
      priority: 10,
    },
    {
      name: 'Referral Bonus',
      description: 'Get $100 when you use a referral code!',
      ruleType: WALLET_RULE_TYPE.REFERRAL_BONUS,
      valueType: WALLET_RULE_VALUE_TYPE.FLAT_AMOUNT,
      value: 100,
      status: WALLET_RULE_STATUS.ACTIVE,
      priority: 20,
    }
  ];

  for (const rule of rules) {
    await WalletRuleModel.findOneAndUpdate(
      { ruleType: rule.ruleType },
      rule,
      { upsert: true, new: true }
    );
  }

  console.log('Wallet rules seeded successfully');
};
