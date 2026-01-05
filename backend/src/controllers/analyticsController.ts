import { NextFunction, Response } from 'express';
import { analyticsService } from '../services/concrete/analyticsService';
import { exportService } from '../services/concrete/exportService';
import { IRequest } from '../interfaces';
import { HTTP_STATUS_CODE } from '../constants';

export class AnalyticsController {
  /**
   * Get sales analytics (Revenue, Orders, AOV)
   */
  async getSalesAnalytics(req: IRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await analyticsService.getRevenueAnalytics(start, end);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Sales analytics fetched successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getProductAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await analyticsService.getProductPerformance(start, end);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product analytics fetched successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await analyticsService.getCustomerAnalytics(start, end);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Customer analytics fetched successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  exportSales = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, format = 'xlsx' } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await exportService.exportSalesData(start, end, format as 'xlsx' | 'csv');

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=sales-analytics-${Date.now()}.csv`);
        return res.send(data);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-analytics-${Date.now()}.xlsx`);
      return res.send(data);
    } catch (error) {
      next(error);
    }
  };

  exportProducts = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, format = 'xlsx' } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await exportService.exportProductData(start, end, format as 'xlsx' | 'csv');

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=product-analytics-${Date.now()}.csv`);
        return res.send(data);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=product-analytics-${Date.now()}.xlsx`);
      return res.send(data);
    } catch (error) {
      next(error);
    }
  };

  exportCustomers = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, format = 'xlsx' } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await exportService.exportCustomerData(start, end, format as 'xlsx' | 'csv');

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=customer-analytics-${Date.now()}.csv`);
        return res.send(data);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=customer-analytics-${Date.now()}.xlsx`);
      return res.send(data);
    } catch (error) {
      next(error);
    }
  };

  getTaxSummary = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await exportService.getTaxSummary(start, end);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Tax summary fetched successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  getLotAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(end.getDate() - 30));

      const data = await analyticsService.getLotAnalytics(start, end);

      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Lot analytics fetched successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };
}
