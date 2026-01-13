export type FINANCIAL_RECORD_STATUS = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export type TRANSACTION_TYPE = 'INCOME' | 'EXPENSE';

export type INCOME_SUBTYPE = 'ORDER' | 'MANUAL' | 'OTHER';

export type EXPENSE_SUBTYPE = 'LOT_AMOUNT' | 'RETURN' | 'REWARD' | 'MANUAL' | 'OTHER';

export type ECOMMERCE_PLATFORM = 'AMAZON' | 'FLIPKART' | 'MEESHO' | 'AJIO' | 'MYNTRA' | 'SNAPDEAL' | 'OTHER';

export const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'IndusInd Bank',
  'IDFC First Bank',
  'Yes Bank',
  'Federal Bank',
  'IDBI Bank',
  'Central Bank of India',
  'Indian Bank',
  'UCO Bank',
  'Bank of Maharashtra',
  'Punjab & Sind Bank',
  'Indian Overseas Bank',
  'Karur Vysya Bank',
  'Jammu & Kashmir Bank',
  'South Indian Bank',
  'City Union Bank',
  'RBL Bank',
  'Bandhan Bank',
  'AU Small Finance Bank',
  'Equitas Small Finance Bank',
  'Ujjivan Small Finance Bank'
];

export interface IFinancialRecordAttributes {
  _id: string;
  transactionType: TRANSACTION_TYPE;
  subtype: string;
  amount: number;
  startDate: string | Date;
  endDate: string | Date;
  isAutomatic: boolean;
  platform?: ECOMMERCE_PLATFORM;
  bankName?: string;
  accountNumber?: string;
  orderId?: string;
  lotId?: string;
  returnId?: string;
  walletTransactionId?: string;
  notes?: string;
  status: FINANCIAL_RECORD_STATUS;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IFinancialRecordFilters {
  search?: string;
  transactionType?: TRANSACTION_TYPE | TRANSACTION_TYPE[];
  subtype?: string | string[];
  platform?: ECOMMERCE_PLATFORM | ECOMMERCE_PLATFORM[];
  bankName?: string;
  isAutomatic?: boolean;
  status?: FINANCIAL_RECORD_STATUS | FINANCIAL_RECORD_STATUS[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}

export interface IFinancialAnalytics {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  incomeBySubtype: { subtype: string; amount: number; count: number }[];
  expenseBySubtype: { subtype: string; amount: number; count: number }[];
  platformBreakdown: { platform: string; amount: number; count: number }[];
  recentTransactions: IFinancialRecordAttributes[];
}

export interface IFinancialRecordCreateReq {
  transactionType: TRANSACTION_TYPE;
  subtype: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  platform?: ECOMMERCE_PLATFORM;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
}

export interface IFinancialRecordUpdateReq {
  transactionType?: TRANSACTION_TYPE;
  subtype?: string;
  amount?: number;
  startDate?: Date;
  endDate?: Date;
  platform?: ECOMMERCE_PLATFORM;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
  status?: FINANCIAL_RECORD_STATUS;
}
