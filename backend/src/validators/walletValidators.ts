import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { WALLET_STATUS } from '../constants/wallet';

// Manual credit/debit schema
const manualCreditDebitSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.any().optional()
});

// Filter schema for wallet queries
const walletFilterSchema = z.object({
  userId: z.string().optional(),
  status: z.nativeEnum(WALLET_STATUS).optional(),
  isDeleted: z.boolean().optional(),
});

// Wallet create schema
const walletCreateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  availableBalance: z.number().nonnegative().optional(),
  blockedBalance: z.number().nonnegative().optional(),
  totalEarned: z.number().nonnegative().optional(),
  totalSpent: z.number().nonnegative().optional(),
  totalExpired: z.number().nonnegative().optional(),
  status: z.nativeEnum(WALLET_STATUS).optional(),
});

// Wallet update schema
const walletUpdateSchema = walletCreateSchema.partial();

export class WalletValidator {
  // Standard CRUD validators
  create = validate(
    z.object({
      body: walletCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: walletUpdateSchema,
    })
  );

  getOne = validate(
    z.object({
      params: z.object({ id: z.string().optional() }),
      query: z.object({ 
        _id: z.string().optional(), 
        userId: z.string().optional() 
      }).optional(),
      body: z.object({ 
        _id: z.string().optional(), 
        userId: z.string().optional() 
      }).optional(),
    })
  );

  getAll = validate(
    z.object({
      query: walletFilterSchema.optional(),
      body: walletFilterSchema.optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      query: walletFilterSchema.extend({
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      body: walletFilterSchema.optional(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: walletFilterSchema,
    })
  );

  // Custom wallet validators
  getWalletByUserId = validate(
    z.object({
      params: z.object({ 
        userId: z.string().min(1, 'User ID is required') 
      }),
    })
  );

  manualCredit = validate(
    z.object({
      body: manualCreditDebitSchema,
    })
  );

  manualDebit = validate(
    z.object({
      body: manualCreditDebitSchema,
    })
  );

  recalculateBalance = validate(
    z.object({
      params: z.object({ 
        walletId: z.string().min(1, 'Wallet ID is required') 
      }),
    })
  );

  blockWallet = validate(
    z.object({
      params: z.object({ 
        walletId: z.string().min(1, 'Wallet ID is required') 
      }),
    })
  );

  unblockWallet = validate(
    z.object({
      params: z.object({ 
        walletId: z.string().min(1, 'Wallet ID is required') 
      }),
    })
  );

  // Customer validators (no params needed, uses req.user)
  getMyWallet = validate(
    z.object({
      body: z.object({}).optional(),
    })
  );

  getMyBalance = validate(
    z.object({
      body: z.object({}).optional(),
    })
  );
}

export const walletValidator = new WalletValidator();

