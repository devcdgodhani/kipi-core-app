export interface IExportService {
  exportSalesData(startDate: Date, endDate: Date, format?: 'xlsx' | 'csv'): Promise<any>;
  exportProductData(startDate: Date, endDate: Date, format?: 'xlsx' | 'csv'): Promise<any>;
  exportCustomerData(startDate: Date, endDate: Date, format?: 'xlsx' | 'csv'): Promise<any>;
  exportLogisticsData(startDate: Date, endDate: Date, format?: 'xlsx' | 'csv'): Promise<any>;
  exportCourierPerformance(startDate: Date, endDate: Date, format?: 'xlsx' | 'csv'): Promise<any>;
  getTaxSummary(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    taxCollected: number;
    netRevenue: number;
    taxRate: number;
    orders: number;
  }>;
}
