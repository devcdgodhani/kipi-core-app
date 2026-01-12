import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import { 
  WALLET_TRANSACTION_TYPE, 
  WALLET_SOURCE_TYPE, 
  WALLET_TRANSACTION_STATUS, 
  WALLET_CREATED_BY 
} from '../constants/walletTransaction';

// Filter schema for transaction queries
const transactionFilterSchema = z.object({
  userId: z.string().optional(),
  walletId: z.string().optional(),
  transactionType: z.nativeEnum(WALLET_TRANSACTION_TYPE).optional(),
  sourceType: z.nativeEnum(WALLET_SOURCE_TYPE).optional(),
  status: z.nativeEnum(WALLET_TRANSACTION_STATUS).optional(),
  isDeleted: z.boolean().optional(),
});

// Transaction create schema
const transactionCreateSchema = z.object({
  walletId: z.string().min(1, 'Wallet ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  transactionType: z.nativeEnum(WALLET_TRANSACTION_TYPE),
  sourceType: z.nativeEnum(WALLET_SOURCE_TYPE),
  sourceReferenceId: z.string().optional(),
  amount: z.number(),
  balanceBefore: z.number().nonnegative(),
  balanceAfter: z.number().nonnegative(),
  description: z.string().min(1, 'Description is required'),
  status: z.nativeEnum(WALLET_TRANSACTION_STATUS).optional(),
  expiryDate: z.string().transform((val) => new Date(val)).optional(),
  metadata: z.any().optional(),
  createdByType: z.nativeEnum(WALLET_CREATED_BY).optional(),
  adminUserId: z.string().optional(),
});

// Transaction update schema
const transactionUpdateSchema = z.object({
  status: z.nativeEnum(WALLET_TRANSACTION_STATUS).optional(),
  expiryDate: z.string().transform((val) => new Date(val)).optional(),
  description: z.string().optional(),
  metadata: z.any().optional(),
});

export class WalletTransactionValidator {
  // Standard CRUD validators
  create = validate(
    z.object({
      body: transactionCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({ id: z.string() }),
      body: transactionUpdateSchema,
    })
  );

  getOne = validate(
    z.object({
      params: z.object({ id: z.string().optional() }),
      query: z.object({ 
        _id: z.string().optional(),
        userId: z.string().optional(),
        walletId: z.string().optional()
      }).optional(),
      body: z.object({ 
        _id: z.string().optional(),
        userId: z.string().optional(),
        walletId: z.string().optional()
      }).optional(),
    })
  );

  getAll = validate(
    z.object({
      query: transactionFilterSchema.optional(),
      body: transactionFilterSchema.optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      query: transactionFilterSchema.extend({
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      body: transactionFilterSchema.optional(),
    })
  );

  deleteByFilter = validate(
    z.object({
      body: transactionFilterSchema,
    })
  );

  // Custom transaction validators
  confirmTransaction = validate(
    z.object({
      params: z.object({ 
        transactionId: z.string().min(1, 'Transaction ID is required') 
      }),
    })
  );

  reverseTransaction = validate(
    z.object({
      params: z.object({ 
        transactionId: z.string().min(1, 'Transaction ID is required') 
      }),
      body: z.object({
        reason: z.string().min(1, 'Reversal reason is required')
      })
    })
  );

  expireTransaction = validate(
    z.object({
      params: z.object({ 
        transactionId: z.string().min(1, 'Transaction ID is required') 
      }),
    })
  );

  // Customer validators
  getMyTransactions = validate(
    z.object({
      query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      body: z.object({}).optional(),
    })
  );

  getPending = validate(
    z.object({
      body: z.object({}).optional(),
    })
  );

  getExpiring = validate(
    z.object({
      query: z.object({
        days: z.string().optional()
      }).optional(),
      body: z.object({}).optional(),
    })
  );
}

export const walletTransactionValidator = new WalletTransactionValidator();
