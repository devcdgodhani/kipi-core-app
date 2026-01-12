import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, WALLET_RULE_SUCCESS_MESSAGES } from '../constants';
import { walletRuleService } from '../services/concrete/walletRuleService';
import { IApiResponse, IPaginationData, IWalletRuleAttributes } from '../interfaces';

export class WalletRuleController {
  private get walletRuleService() { return walletRuleService; }

  constructor() {}

  /*********** Admin Endpoints (Standard CRUD) ***********/

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query as any, ...req.body };
      
      let result;
      if (id) {
        result = await this.walletRuleService.findById(id);
      } else {
        const { filter, options } = this.walletRuleService.generateFilter({
          filters: reqData
        });
        result = await this.walletRuleService.findOne(filter, options);
      }

      const response: IApiResponse<IWalletRuleAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.GET_SUCCESS,
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
      const { filter, options } = this.walletRuleService.generateFilter({
        filters: reqData
      });

      const ruleList = await this.walletRuleService.findAll(filter, options);

      const response: IApiResponse<IWalletRuleAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: ruleList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query as any, ...req.body };
      const { filter, options } = this.walletRuleService.generateFilter({
        filters: reqData
      });

      const ruleList = await this.walletRuleService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWalletRuleAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.GET_SUCCESS,
        data: ruleList
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ruleData = req.body;
      const newRule = await this.walletRuleService.create(ruleData, { userId: req.user?._id });

      const response: IApiResponse<IWalletRuleAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newRule
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

      await this.walletRuleService.updateOne({ _id: id } as any, updateData, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.UPDATE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.walletRuleService.generateFilter({
        filters: reqData
      });

      await this.walletRuleService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.DELETE_SUCCESS
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Custom Admin Endpoints ***********/

  activateRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ruleId } = req.params;
      
      const rule = await this.walletRuleService.activateRule(ruleId);

      const response: IApiResponse<IWalletRuleAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.ACTIVATED,
        data: rule
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deactivateRule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ruleId } = req.params;
      
      const rule = await this.walletRuleService.deactivateRule(ruleId);

      const response: IApiResponse<IWalletRuleAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WALLET_RULE_SUCCESS_MESSAGES.DEACTIVATED,
        data: rule
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  calculateCashback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderAmount, ruleType } = req.body;
      
      const result = await this.walletRuleService.calculateCashback(orderAmount, ruleType);

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Cashback calculated successfully',
        data: result
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}

export const walletRuleController = new WalletRuleController();
