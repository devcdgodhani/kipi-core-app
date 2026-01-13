import { z } from 'zod';
import { validate } from '../helpers/zodValidator';
import {
  baseFilterSchema,
  paginationSchema,
  stringFilter,
  numberFilter,
  dateFilter
} from './validatorCommon';
import { 
  TRANSACTION_TYPE, 
  INCOME_SUBTYPE, 
  EXPENSE_SUBTYPE, 
  ECOMMERCE_PLATFORM,
  FINANCIAL_RECORD_STATUS 
} from '../constants/financialRecord';

const financialRecordFilterSchema = baseFilterSchema.extend({
  transactionType: stringFilter,
  subtype: stringFilter,
  platform: stringFilter,
  bankName: stringFilter,
  isAutomatic: z.boolean().optional(),
  status: stringFilter,
  startDate: dateFilter,
  endDate: dateFilter,
  amount: numberFilter,
});

const financialRecordCreateSchema = z.object({
  transactionType: z.nativeEnum(TRANSACTION_TYPE),
  subtype: z.string().min(1),
  amount: z.number().min(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  platform: z.nativeEnum(ECOMMERCE_PLATFORM).optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  notes: z.string().optional(),
}).strict();

const financialRecordUpdateSchema = financialRecordCreateSchema.partial().extend({
  status: z.nativeEnum(FINANCIAL_RECORD_STATUS).optional(),
});

const analyticsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export default class FinancialRecordValidator {
  getOne = validate(
    z.object({
      body: financialRecordFilterSchema.partial().optional(),
      query: financialRecordFilterSchema.partial().optional(),
    })
  );

  getAll = validate(
    z.object({
      body: financialRecordFilterSchema.partial().optional(),
      query: financialRecordFilterSchema.partial().optional(),
    })
  );

  getWithPagination = validate(
    z.object({
      body: financialRecordFilterSchema.partial().merge(paginationSchema).optional(),
      query: financialRecordFilterSchema.partial().merge(paginationSchema).optional(),
    })
  );

  create = validate(
    z.object({
      body: financialRecordCreateSchema,
    })
  );

  updateById = validate(
    z.object({
      params: z.object({
        id: z.string(),
      }),
      body: financialRecordUpdateSchema,
    })
  );

  deleteByFilter = validate(
    z.object({
      body: financialRecordFilterSchema.partial(),
    })
  );

  getAnalytics = validate(
    z.object({
      query: analyticsQuerySchema,
    })
  );

  getReports = validate(
    z.object({
      query: z.object({
        type: z.enum(['DAILY_TREND', 'TYPE_BREAKDOWN', 'LOT_PROFITABILITY', 'BANK_REPORT']),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      })
    })
  );
}
