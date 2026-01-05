import axiosInstance from './http';
import qs from 'qs';

export interface IRevenueAnalytics {
  revenue: number;
  orders: number;
  aov: number;
  timeline: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface IProductAnalytics {
  topProducts: {
    _id: string; // product id
    name: string;
    skuCode: string; // From backend aggregation
    totalSold: number;
    totalRevenue: number;
  }[];
  topReturns: {
    _id: string; // product id
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
    lastOrderDate: string; // JSON date string
    totalSpend: number;
  }[];
  acquisition: {
    newCustomers: { revenue: number; count: number };
    returningCustomers: { revenue: number; count: number };
  };
}

export interface ILotAnalytics {
  stockOverview: {
    totalValue: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  expiryRisks: {
    expired: number;
    expiringNext30Days: number;
    expiringNext90Days: number;
  };
  lotMovements: {
    date: string;
    received: number;
    sold: number;
  }[];
}

export const analyticsService = {
  getSalesAnalytics: async (startDate?: Date, endDate?: Date): Promise<IRevenueAnalytics> => {
    const query = qs.stringify({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }, { addQueryPrefix: true });
    const response = await axiosInstance.get<any, { data: IRevenueAnalytics }>(`/analytics/sales${query}`);
    return response.data;
  },
  getProductAnalytics: async (startDate?: Date, endDate?: Date): Promise<IProductAnalytics> => {
    const query = qs.stringify({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }, { addQueryPrefix: true });
    const response = await axiosInstance.get<any, { data: IProductAnalytics }>(`/analytics/products${query}`);
    return response.data;
  },
  getCustomerAnalytics: async (startDate?: Date, endDate?: Date): Promise<ICustomerAnalytics> => {
    const query = qs.stringify({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }, { addQueryPrefix: true });
    const response = await axiosInstance.get<any, { data: ICustomerAnalytics }>(`/analytics/customers${query}`);
    return response.data;
  },
  getLotAnalytics: async (startDate?: Date, endDate?: Date): Promise<ILotAnalytics> => {
    const query = qs.stringify({
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    }, { addQueryPrefix: true });
    const response = await axiosInstance.get<any, { data: ILotAnalytics }>(`/analytics/lots${query}`);
    return response.data;
  },
};
