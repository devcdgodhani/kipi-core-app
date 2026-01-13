import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, FINANCIAL_RECORD_SUCCESS_MESSAGES } from '../constants';
import { FinancialRecordService } from '../services/concrete/financialRecordService';
import {
  TFinancialRecordRes,
  TFinancialRecordListRes,
  TFinancialRecordListPaginationRes,
  TFinancialRecordCreateReq,
  TFinancialRecordUpdateReq,
  TFinancialAnalyticsRes
} from '../types/financialRecord';
import { IApiResponse } from '../interfaces';

export default class FinancialRecordController {
  private financialRecordService = new FinancialRecordService();

  /*********** Fetch Financial Records ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.financialRecordService.generateFilter({
        filters: reqData,
      });

      const record = await this.financialRecordService.findOne(filter, options);

      const response: TFinancialRecordRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.GET_SUCCESS,
        data: record as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.financialRecordService.generateFilter({
        filters: reqData,
      });

      const records = await this.financialRecordService.findAll(filter, options);

      const response: TFinancialRecordListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.GET_SUCCESS,
        data: records as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.financialRecordService.generateFilter({
        filters: reqData,
      });

      // Populate references if needed
      options.populate = [
        { path: 'orderId', select: 'orderNumber totalAmount' },
        { path: 'lotId', select: 'lotNumber basePrice' },
        { path: 'returnId', select: 'returnNumber refundAmount' },
        { path: 'walletTransactionId', select: 'amount description' }
      ];

      const recordList = await this.financialRecordService.findAllWithPagination(filter, options);

      const response: TFinancialRecordListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.GET_SUCCESS,
        data: recordList as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Reporting Endpoints ***********/
  getDailyTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Implementation for getDailyTrends
      // This method was not fully provided in the instruction, so it's left as a placeholder.
      // You would typically extract startDate, endDate from req.query and call a service method.
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: "Daily trends fetched successfully (placeholder)",
        data: []
      });
    } catch (error) {
      next(error);
    }
  }

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const end = endDate ? new Date(endDate as string) : new Date();

      let data;
      if (type === 'DAILY_TREND') {
        data = await this.financialRecordService.getDailyTrends(start, end);
      } else if (type === 'TYPE_BREAKDOWN') {
        data = await this.financialRecordService.getTypeBreakdown(start, end);
      } else if (type === 'LOT_PROFITABILITY') {
        data = await this.financialRecordService.getLotProfitability(start, end);
      } else if (type === 'BANK_REPORT') {
        data = await this.financialRecordService.getBankReports(start, end);
      } else {
        return res.status(400).json({
          message: 'Invalid report type',
          success: false
        });
      }

      res.status(200).json({
        data,
        message: 'Reports fetched successfully',
        success: true
      });
    } catch (error) {
      next(error);
    }
  }

  /*********** Create Financial Record ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: TFinancialRecordCreateReq = req.body;
      const createData = {
        ...reqData,
        isAutomatic: false // Manual records are never automatic
      };
      const newRecord = await this.financialRecordService.create(createData as any, { userId: req.user?._id });

      const response: TFinancialRecordRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newRecord as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Financial Record ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: TFinancialRecordUpdateReq = req.body;

      await this.financialRecordService.updateOne({ _id: id }, updateData as any, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete Financial Record ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.financialRecordService.generateFilter({
        filters: reqData,
      });

      await this.financialRecordService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get Analytics ***********/
  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const analytics = await this.financialRecordService.getAnalytics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: TFinancialAnalyticsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: FINANCIAL_RECORD_SUCCESS_MESSAGES.ANALYTICS_SUCCESS,
        data: analytics,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
