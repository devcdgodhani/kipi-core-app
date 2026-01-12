import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WALLET_SUCCESS_MESSAGES } from '../constants';
import { walletService } from '../services/concrete/walletService';
import { IApiResponse, IPaginationData, IWalletAttributes } from '../interfaces';

export class WalletController {
  private get walletService() { return walletService; }

  constructor() {}

  /*********** Customer Endpoints ***********/

  /**
   * Get current user's wallet
   */
  getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error('User not found in request');
      }

      const wallet = await this.walletService.getOrCreateWallet(userId.toString());

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get current user's wallet balance only
   */
  getMyBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        throw new Error('User not found in request');
      }

      const balance = await this.walletService.getWalletBalance(userId.toString());

      const response: IApiResponse<{ balance: number }> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: { balance }
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Admin Endpoints (Standard CRUD) ***********/

  /**
   * Get one wallet
   */
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query as any, ...req.body };
      
      let result;
      if (id) {
        result = await this.walletService.findById(id);
      } else {
        const { filter, options } = this.walletService.generateFilter({
          filters: reqData
        });
        result = await this.walletService.findOne(filter, options);
      }

      const response: IApiResponse<IWalletAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: result
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get all wallets
   */
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };
      const { filter, options } = this.walletService.generateFilter({
        filters: reqData
      });

      const walletList = await this.walletService.findAll(filter, options);

      const response: IApiResponse<IWalletAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: walletList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get wallets with pagination
   */
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };
      const { filter, options } = this.walletService.generateFilter({
        filters: reqData
      });

      const walletList = await this.walletService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWalletAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: walletList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Create wallet (admin only)
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const walletData = req.body;
      const newWallet = await this.walletService.create(walletData, { userId: req.user?._id });

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WALLET_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newWallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Update wallet by ID
   */
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await this.walletService.updateOne({ _id: id } as any, updateData, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.UPDATE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Delete wallet by filter
   */
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.walletService.generateFilter({
        filters: reqData
      });

      await this.walletService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.DELETE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Custom Admin Endpoints ***********/

  /**
   * Get wallet by user ID
   */
  getWalletByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const wallet = await this.walletService.getWalletByUserId(userId);

      const response: IApiResponse<IWalletAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.GET_SUCCESS,
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Manual credit (admin only)
   */
  manualCredit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, description, metadata } = req.body;
      
      const wallet = await this.walletService.creditWallet(userId, amount, {
        description,
        ...metadata,
        adminUserId: req.user?._id
      });

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.CREDIT_SUCCESS,
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Manual debit (admin only)
   */
  manualDebit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, description, metadata } = req.body;
      
      const wallet = await this.walletService.debitWallet(userId, amount, {
        description,
        ...metadata,
        adminUserId: req.user?._id
      });

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.DEBIT_SUCCESS,
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Recalculate wallet balance
   */
  recalculateBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      
      const wallet = await this.walletService.recalculateBalance(walletId);

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_SUCCESS_MESSAGES.RECALCULATED,
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Block wallet
   */
  blockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      
      const wallet = await this.walletService.blockWallet(walletId);

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Wallet blocked successfully',
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Unblock wallet
   */
  unblockWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletId } = req.params;
      
      const wallet = await this.walletService.unblockWallet(walletId);

      const response: IApiResponse<IWalletAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Wallet unblocked successfully',
        data: wallet
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}

export const walletController = new WalletController();
