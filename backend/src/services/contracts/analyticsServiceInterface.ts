export interface IRevenueAnalytics {
  revenue: number;
  orders: number;
  aov: number;
  tax: number;
  timeline: {
    date: string;
    revenue: number;
    orders: number;
    aov: number;
    tax: number;
  }[];
}

export interface IProductAnalytics {
  topProducts: {
    _id: string;
    name: string;
    skuCode: string;
    totalSold: number;
    totalRevenue: number;
  }[];
  topReturns: {
    _id: string;
    name: string;
    skuCode: string;
    returnCount: number;
  }[];
}

export interface ICustomerAnalytics {
  topSpenders: {
    _id: string;
    name: string;
    email: string;
    totalSpend: number;
    orderCount: number;
  }[];
  churnRisk: {
    _id: string;
    name: string;
    email: string;
    lastOrderDate: Date;
    totalSpend: number;
  }[];
  acquisition: {
    newCustomers: { revenue: number; count: number };
    returningCustomers: { revenue: number; count: number };
  };
}

export interface ILotAnalytics {
  stockOverview: { totalValue: number; totalStock: number; lowStockItems: number; outOfStockItems: number };
  expiryRisks: { expired: number; expiringNext30Days: number; expiringNext90Days: number };
  lotMovements: { date: string; received: number; sold: number }[];
}

export interface ILogisticsAnalytics {
  rtoRate: number;
  totalShipments: number;
  rtoCount: number;
  ndrCount: number;
  ndrConversionRate: number; // Percentage of NDRs that ended in successful delivery
  avgRtoAge: number; // Days
  rtoReasons: { reason: string; count: number }[];
}

export interface ICourierPerformance {
  courierId: string;
  courierName: string;
  avgDeliveryTime: number; // Days
  rtoRate: number;
  ndrRate: number;
  slaAdherence: number; // Percentage
  totalShipments: number;
}

export interface IWalletAnalytics {
  totalBalance: number;
  blockedBalance: number;
  pendingCashback: {
    count: number;
    amount: number;
  };
  expiringSoon: {
    count: number;
    amount: number;
  };
  totalWallets: number;
}

export interface IAnalyticsService {
  getRevenueAnalytics(startDate: Date, endDate: Date): Promise<IRevenueAnalytics>;
  getProductPerformance(startDate: Date, endDate: Date): Promise<IProductAnalytics>;
  getCustomerAnalytics(startDate: Date, endDate: Date): Promise<ICustomerAnalytics>;
  getLotAnalytics(startDate: Date, endDate: Date): Promise<ILotAnalytics>;
  getLogisticsAnalytics(startDate: Date, endDate: Date): Promise<ILogisticsAnalytics>;
  getCourierPerformance(startDate: Date, endDate: Date): Promise<ICourierPerformance[]>;
  getWalletAnalytics(startDate: Date, endDate: Date): Promise<IWalletAnalytics>;
}
