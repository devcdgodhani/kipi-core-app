import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { WALLET_RULE_TYPE, WALLET_RULE_VALUE_TYPE, WALLET_RULE_STATUS } from '../constants/walletRule';

// Filter schema for wallet rule queries
const walletRuleFilterSchema = z.object({
  ruleType: z.nativeEnum(WALLET_RULE_TYPE).optional(),
  status: z.nativeEnum(WALLET_RULE_STATUS).optional(),
  isDeleted: z.boolean().optional(),
});

// Wallet rule create schema
const walletRuleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  ruleType: z.nativeEnum(WALLET_RULE_TYPE),
  valueType: z.nativeEnum(WALLET_RULE_VALUE_TYPE),
  value: z.number().nonnegative('Value must be non-negative'),
  minOrderAmount: z.number().nonnegative().optional(),
  maxCashbackAmount: z.number().nonnegative().optional(),
  expiryDays: z.number().int().nonnegative().optional(),
  startDate: z.preprocess((val) => (val === '' ? null : val), z.string().optional().nullable()).transform((val) => (val ? new Date(val) : val === null ? null : undefined)),
  endDate: z.preprocess((val) => (val === '' ? null : val), z.string().optional().nullable()).transform((val) => (val ? new Date(val) : val === null ? null : undefined)),
  status: z.nativeEnum(WALLET_RULE_STATUS).optional(),
  priority: z.number().int().optional(),
  metadata: z.any().optional(),
});

// Wallet rule update schema
const walletRuleUpdateSchema = walletRuleCreateSchema.partial();

export class WalletRuleValidator {
  // Standard CRUD validators
  create = validate(
    z.object({
      body: walletRuleCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: walletRuleUpdateSchema,
    })
  );

  getOne = validate(
    z.object({
      params: z.object({ id: z.string().optional() }),
      query: z.object({ 
        _id: z.string().optional(),
        ruleType: z.nativeEnum(WALLET_RULE_TYPE).optional()
      }).optional(),
      body: z.object({ 
        _id: z.string().optional(),
        ruleType: z.nativeEnum(WALLET_RULE_TYPE).optional()
      }).optional(),
    })
  );

  getAll = validate(
    z.object({
      query: walletRuleFilterSchema.optional(),
      body: walletRuleFilterSchema.optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      query: walletRuleFilterSchema.extend({
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      body: walletRuleFilterSchema.optional(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: walletRuleFilterSchema,
    })
  );

  // Custom wallet rule validators
  activateRule = validate(
    z.object({
      params: z.object({ 
        ruleId: z.string().min(1, 'Rule ID is required') 
      }),
    })
  );

  deactivateRule = validate(
    z.object({
      params: z.object({ 
        ruleId: z.string().min(1, 'Rule ID is required') 
      }),
    })
  );

  calculateCashback = validate(
    z.object({
      body: z.object({
        orderAmount: z.number().positive('Order amount must be positive'),
        ruleType: z.nativeEnum(WALLET_RULE_TYPE).optional()
      })
    })
  );
}

export const walletRuleValidator = new WalletRuleValidator();
