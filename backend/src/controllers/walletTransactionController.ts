import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WALLET_TRANSACTION_SUCCESS_MESSAGES } from '../constants';
import { walletTransactionService } from '../services/concrete/walletTransactionService';
import { IApiResponse, IPaginationData, IWalletTransactionAttributes } from '../interfaces';

export class WalletTransactionController {
  private get walletTransactionService() { return walletTransactionService; }

  constructor() {}

  /*********** Customer Endpoints ***********/

  /**
   * Get current user's transactions
   */
  getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };
      const userId = req.user?._id;
      if (!userId) {
        throw new Error('User not found in request');
      }

      const filters = {
        ...reqData,
        userId
      };
      delete (filters as any).filter;

      const { filter, options } = this.walletTransactionService.generateFilter({
        filters
      });

      const transactionList = await this.walletTransactionService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWalletTransactionAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: transactionList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get pending transactions
   */
  getPending = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error('User not found in request');
      }

      const transactions = await this.walletTransactionService.getPendingTransactions(
        userId.toString()
      );

      const response: IApiResponse<IWalletTransactionAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: transactions
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get expiring transactions
   */
  getExpiring = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error('User not found in request');
      }

      const days = parseInt(req.query.days as string) || 7;
      const transactions = await this.walletTransactionService.getExpiringTransactions(
        userId.toString(),
        days
      );

      const response: IApiResponse<IWalletTransactionAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: transactions
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Admin Endpoints (Standard CRUD) ***********/

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query as any, ...req.body };
      
      let result;
      if (id) {
        result = await this.walletTransactionService.findById(id);
      } else {
        const { filter, options } = this.walletTransactionService.generateFilter({
          filters: reqData
        });
        result = await this.walletTransactionService.findOne(filter, options);
      }

      const response: IApiResponse<IWalletTransactionAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: result
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };
      const { filter, options } = this.walletTransactionService.generateFilter({
        filters: reqData
      });

      const transactionList = await this.walletTransactionService.findAll(filter, options);

      const response: IApiResponse<IWalletTransactionAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: transactionList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };

      // Merge top-level params into filter, letting nested filter take precedence
      const filters = {
        ...reqData,
        ...(reqData.filter || {})
      };
      delete (filters as any).filter;

      const { filter, options } = this.walletTransactionService.generateFilter({
        filters
      });

      const transactionList = await this.walletTransactionService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWalletTransactionAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.GET_SUCCESS,
        data: transactionList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactionData = req.body;
      const newTransaction = await this.walletTransactionService.create(transactionData, { userId: req.user?._id });

      const response: IApiResponse<IWalletTransactionAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newTransaction
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await this.walletTransactionService.updateOne({ _id: id } as any, updateData, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.UPDATE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.walletTransactionService.generateFilter({
        filters: reqData
      });

      await this.walletTransactionService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.DELETE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Custom Admin Endpoints ***********/

  confirmTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId } = req.params;
      
      const transaction = await this.walletTransactionService.confirmTransaction(transactionId);

      const response: IApiResponse<IWalletTransactionAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.CONFIRMED,
        data: transaction
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  reverseTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;
      
      const transaction = await this.walletTransactionService.reverseTransaction(transactionId, reason);

      const response: IApiResponse<IWalletTransactionAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.REVERSED,
        data: transaction
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  expireTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId } = req.params;
      
      const transaction = await this.walletTransactionService.expireTransaction(transactionId);

      const response: IApiResponse<IWalletTransactionAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_TRANSACTION_SUCCESS_MESSAGES.EXPIRED,
        data: transaction
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}

export const walletTransactionController = new WalletTransactionController();
