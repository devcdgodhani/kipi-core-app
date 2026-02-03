export interface WalletTransaction {
  _id: string;
  walletId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  category: 'ORDER_REFUND' | 'CASHBACK' | 'PAYMENT' | 'TOPUP' | 'REFERRAL' | 'OTHER';
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'EXPIRED';
  expiryDate?: string;
  createdAt: string;
  orderId?: string;
}

export interface Wallet {
  _id: string;
  userId: string;
  balance: number; // legacy/total
  availableBalance: number;
  blockedBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN';
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransactionList {
  recordList: WalletTransaction[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}
