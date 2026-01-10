import ExcelJS from 'exceljs';
import { analyticsService } from './analyticsService';

import { IExportService } from '../contracts/exportServiceInterface';

export class ExportService implements IExportService {
  private get analyticsService() { return analyticsService; }

  constructor() {}
  /**
   * Export Sales Analytics to Excel or CSV
   */
  async exportSalesData(startDate: Date, endDate: Date, format: 'xlsx' | 'csv' = 'xlsx'): Promise<any> {
    const data = await analyticsService.getRevenueAnalytics(startDate, endDate);

    if (format === 'csv') {
      // Generate CSV
      let csv = 'Date,Revenue,Orders,AOV\n';
      csv += `Summary,${data.revenue},${data.orders},${data.aov}\n\n`;
      csv += 'Timeline:\n';
      csv += 'Date,Revenue,Orders\n';
      data.timeline.forEach(item => {
        csv += `${item.date},${item.revenue},${item.orders}\n`;
      });
      return csv;
    }

    // Generate Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Analytics');

    // Summary Section
    worksheet.addRow(['Sales Analytics Report']);
    worksheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    worksheet.addRow([]);
    worksheet.addRow(['Metric', 'Value']);
    worksheet.addRow(['Total Revenue', data.revenue]);
    worksheet.addRow(['Total Orders', data.orders]);
    worksheet.addRow(['Average Order Value', data.aov]);
    worksheet.addRow([]);

    // Timeline Section
    worksheet.addRow(['Timeline Data']);
    worksheet.addRow(['Date', 'Revenue', 'Orders']);
    data.timeline.forEach(item => {
      worksheet.addRow([item.date, item.revenue, item.orders]);
    });

    // Styling
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(4).font = { bold: true };
    worksheet.getRow(9).font = { bold: true };
    worksheet.getRow(10).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export Product Performance to Excel or CSV
   */
  async exportProductData(startDate: Date, endDate: Date, format: 'xlsx' | 'csv' = 'xlsx'): Promise<any> {
    const data = await analyticsService.getProductPerformance(startDate, endDate);

    if (format === 'csv') {
      let csv = 'Product Performance Report\n\n';
      csv += 'Top Selling Products:\n';
      csv += 'Product Name,SKU Code,Total Sold,Total Revenue\n';
      data.topProducts.forEach(p => {
        csv += `${p.name},${p.skuCode},${p.totalSold},${p.totalRevenue}\n`;
      });
      csv += '\nTop Returned Products:\n';
      csv += 'Product Name,SKU Code,Return Count\n';
      data.topReturns.forEach(p => {
        csv += `${p.name},${p.skuCode},${p.returnCount}\n`;
      });
      return csv;
    }

    // Generate Excel
    const workbook = new ExcelJS.Workbook();
    
    // Top Products Sheet
    const productsSheet = workbook.addWorksheet('Top Products');
    productsSheet.addRow(['Product Performance Report']);
    productsSheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    productsSheet.addRow([]);
    productsSheet.addRow(['Product Name', 'SKU Code', 'Total Sold', 'Total Revenue']);
    data.topProducts.forEach(p => {
      productsSheet.addRow([p.name, p.skuCode, p.totalSold, p.totalRevenue]);
    });

    // Top Returns Sheet
    const returnsSheet = workbook.addWorksheet('Top Returns');
    returnsSheet.addRow(['Product Returns Report']);
    returnsSheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    returnsSheet.addRow([]);
    returnsSheet.addRow(['Product Name', 'SKU Code', 'Return Count']);
    data.topReturns.forEach(p => {
      returnsSheet.addRow([p.name, p.skuCode, p.returnCount]);
    });

    // Styling
    productsSheet.getRow(1).font = { bold: true, size: 14 };
    productsSheet.getRow(4).font = { bold: true };
    returnsSheet.getRow(1).font = { bold: true, size: 14 };
    returnsSheet.getRow(4).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export Customer Analytics to Excel or CSV
   */
  async exportCustomerData(startDate: Date, endDate: Date, format: 'xlsx' | 'csv' = 'xlsx'): Promise<any> {
    const data = await analyticsService.getCustomerAnalytics(startDate, endDate);

    if (format === 'csv') {
      let csv = 'Customer Insights Report\n\n';
      csv += 'Top Spenders:\n';
      csv += 'Name,Email,Total Spend,Order Count\n';
      data.topSpenders.forEach(c => {
        csv += `${c.name},${c.email},${c.totalSpend},${c.orderCount}\n`;
      });
      csv += '\nChurn Risk:\n';
      csv += 'Name,Email,Last Order Date,Total Spend\n';
      data.churnRisk.forEach(c => {
        csv += `${c.name},${c.email},${new Date(c.lastOrderDate).toLocaleDateString()},${c.totalSpend}\n`;
      });
      csv += '\nAcquisition:\n';
      csv += 'Segment,Revenue,Count\n';
      csv += `New Customers,${data.acquisition.newCustomers.revenue},${data.acquisition.newCustomers.count}\n`;
      csv += `Returning Customers,${data.acquisition.returningCustomers.revenue},${data.acquisition.returningCustomers.count}\n`;
      return csv;
    }

    // Generate Excel
    const workbook = new ExcelJS.Workbook();
    
    // Top Spenders Sheet
    const spendersSheet = workbook.addWorksheet('Top Spenders');
    spendersSheet.addRow(['Customer Insights Report']);
    spendersSheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    spendersSheet.addRow([]);
    spendersSheet.addRow(['Name', 'Email', 'Total Spend', 'Order Count']);
    data.topSpenders.forEach(c => {
      spendersSheet.addRow([c.name, c.email, c.totalSpend, c.orderCount]);
    });

    // Churn Risk Sheet
    const churnSheet = workbook.addWorksheet('Churn Risk');
    churnSheet.addRow(['Churn Risk Report']);
    churnSheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    churnSheet.addRow([]);
    churnSheet.addRow(['Name', 'Email', 'Last Order Date', 'Total Spend']);
    data.churnRisk.forEach(c => {
      churnSheet.addRow([c.name, c.email, new Date(c.lastOrderDate).toLocaleDateString(), c.totalSpend]);
    });

    // Acquisition Sheet
    const acquisitionSheet = workbook.addWorksheet('Acquisition');
    acquisitionSheet.addRow(['Acquisition Analysis']);
    acquisitionSheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    acquisitionSheet.addRow([]);
    acquisitionSheet.addRow(['Segment', 'Revenue', 'Count']);
    acquisitionSheet.addRow(['New Customers', data.acquisition.newCustomers.revenue, data.acquisition.newCustomers.count]);
    acquisitionSheet.addRow(['Returning Customers', data.acquisition.returningCustomers.revenue, data.acquisition.returningCustomers.count]);

    // Styling
    spendersSheet.getRow(1).font = { bold: true, size: 14 };
    spendersSheet.getRow(4).font = { bold: true };
    churnSheet.getRow(1).font = { bold: true, size: 14 };
    churnSheet.getRow(4).font = { bold: true };
    acquisitionSheet.getRow(1).font = { bold: true, size: 14 };
    acquisitionSheet.getRow(4).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export Logistics Data (RTO & NDR) to Excel or CSV
   */
  async exportLogisticsData(startDate: Date, endDate: Date, format: 'xlsx' | 'csv' = 'xlsx'): Promise<any> {
    const data = await analyticsService.getLogisticsAnalytics(startDate, endDate);

    if (format === 'csv') {
      let csv = 'Logistics Performance Report\n\n';
      csv += 'Summary Metrics:\n';
      csv += `Total Shipments,${data.totalShipments}\n`;
      csv += `RTO Rate,${data.rtoRate.toFixed(2)}%\n`;
      csv += `NDR Conversion,${data.ndrConversionRate.toFixed(2)}%\n`;
      csv += `Avg RTO Age,${data.avgRtoAge.toFixed(1)} days\n\n`;
      
      csv += 'RTO Reasons:\n';
      csv += 'Reason,Count\n';
      data.rtoReasons.forEach(r => {
        csv += `${r.reason},${r.count}\n`;
      });
      return csv;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Logistics Analytics');
    
    sheet.addRow(['Logistics Performance Report']);
    sheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    sheet.addRow([]);
    
    sheet.addRow(['Metric', 'Value']);
    sheet.addRow(['Total Shipments', data.totalShipments]);
    sheet.addRow(['RTO Rate (%)', data.rtoRate]);
    sheet.addRow(['NDR Conversion (%)', data.ndrConversionRate]);
    sheet.addRow(['Avg RTO Age (Days)', data.avgRtoAge]);
    sheet.addRow([]);
    
    sheet.addRow(['RTO Reasons Distribution']);
    sheet.addRow(['Reason', 'Count']);
    data.rtoReasons.forEach(r => {
      sheet.addRow([r.reason, r.count]);
    });

    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.getRow(4).font = { bold: true };
    sheet.getRow(11).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Export Courier Performance to Excel or CSV
   */
  async exportCourierPerformance(startDate: Date, endDate: Date, format: 'xlsx' | 'csv' = 'xlsx'): Promise<any> {
    const data = await analyticsService.getCourierPerformance(startDate, endDate);

    if (format === 'csv') {
      let csv = 'Courier Performance Benchmarking\n\n';
      csv += 'Courier Name,Total Shipments,RTO Rate (%),NDR Rate (%),Avg Delivery (Days),SLA Adherence (%)\n';
      data.forEach(c => {
        csv += `${c.courierName},${c.totalShipments},${c.rtoRate.toFixed(2)},${c.ndrRate.toFixed(2)},${c.avgDeliveryTime.toFixed(1)},${c.slaAdherence.toFixed(1)}\n`;
      });
      return csv;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Courier Performance');
    
    sheet.addRow(['Courier Performance benchmarking']);
    sheet.addRow(['Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
    sheet.addRow([]);
    
    sheet.addRow(['Courier Name', 'Total Shipments', 'RTO Rate (%)', 'NDR Rate (%)', 'Avg Delivery Time (Days)', 'SLA Adherence (%)']);
    data.forEach(c => {
      sheet.addRow([
        c.courierName, 
        c.totalShipments, 
        c.rtoRate, 
        c.ndrRate, 
        c.avgDeliveryTime, 
        c.slaAdherence
      ]);
    });

    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.getRow(4).font = { bold: true };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Get Tax Summary
   */
  async getTaxSummary(startDate: Date, endDate: Date) {
    const data = await analyticsService.getRevenueAnalytics(startDate, endDate);
    
    // Assuming 18% GST (adjust as needed)
    const taxRate = 0.18;
    const totalTax = Math.round(data.revenue * taxRate);
    const netRevenue = data.revenue - totalTax;

    return {
      totalRevenue: data.revenue,
      taxCollected: totalTax,
      netRevenue,
      taxRate: taxRate * 100,
      orders: data.orders
    };
  }
}

export const exportService = new ExportService();
