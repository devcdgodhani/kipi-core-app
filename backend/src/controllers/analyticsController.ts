import { NextFunction, Response } from 'express';
import { analyticsService } from '../services/concrete/analyticsService';
import { exportService } from '../services/concrete/exportService';
import { IApiResponse, IRequest } from '../interfaces';
import { HTTP_STATUS_CODE } from '../constants';

export class AnalyticsController {
  getProductAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      // Default to last 30 days if not provided
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await analyticsService.getProductPerformance(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product analytics fetched successfully',
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getSalesAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await analyticsService.getRevenueAnalytics(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Sales analytics fetched successfully',
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getCustomerAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await analyticsService.getCustomerAnalytics(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Customer analytics fetched successfully',
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getInventoryAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await analyticsService.getLotAnalytics(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Inventory analytics fetched successfully',
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getDashboardSummary = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const revenue = await analyticsService.getRevenueAnalytics(start, end);
      const logistics = await analyticsService.getLogisticsAnalytics(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Dashboard summary fetched successfully',
        data: { revenue, logistics },
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getTaxSummary = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const summary = await exportService.getTaxSummary(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Tax summary fetched successfully',
        data: summary,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getLogisticsAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await analyticsService.getLogisticsAnalytics(start, end);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Logistics analytics fetched successfully',
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  exportAnalytics = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { type, startDate, endDate } = req.query as any;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      let csv: any;
      let filename = 'analytics';

      switch (type) {
        case 'SALES':
          csv = await exportService.exportSalesData(start, end, 'csv');
          filename = 'sales_report';
          break;
        case 'PRODUCTS':
          csv = await exportService.exportProductData(start, end, 'csv');
          filename = 'product_report';
          break;
        case 'CUSTOMERS':
          csv = await exportService.exportCustomerData(start, end, 'csv');
          filename = 'customer_report';
          break;
        case 'LOGISTICS':
          csv = await exportService.exportLogisticsData(start, end, 'csv');
          filename = 'logistics_report';
          break;
        default:
          throw new Error('Invalid export type');
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      return res.status(200).send(csv);
    } catch (err) {
      return next(err);
    }
  };
}

export const analyticsController = new AnalyticsController();
