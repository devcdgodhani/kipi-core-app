import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from '../services/concrete/loyaltyService';
import { UserService } from '../services/concrete/userService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class LoyaltyController {
    private loyaltyService = new LoyaltyService();
    private userService = new UserService();

    /**
     * Get current user balance and ledger (Customer)
     */
    getUserLoyalty = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const user = await this.userService.findById(userId.toString(), {
                projection: 'loyaltyPoints totalEarnedPoints'
            } as any);
            
            if (!user) {
                return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
                    status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
                    code: HTTP_STATUS_CODE.NOTFOUND.CODE,
                    message: 'User not found'
                });
            }

            const reqData = { ...req.query, ...req.body };
            const ledger = await this.loyaltyService.getUserLedger(userId.toString(), reqData);

            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Loyalty data retrieved',
                data: {
                    balance: user.loyaltyPoints,
                    totalEarned: user.totalEarnedPoints,
                    ledger
                }
            };
            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };

    /**
     * Admin: Get With Pagination (Standard)
     */
    getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = this.loyaltyService.generateFilter({
                filters: reqData,
            });

            const result = await this.loyaltyService.findAllWithPagination(filter, options);

            const response: IApiResponse<IPaginationData<any>> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Loyalty ledger fetched successfully',
                data: result,
            };

            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };

    /**
     * Get One (Standard)
     */
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const reqData = { ...req.query, ...req.body };
            
            let result;
            if (id) {
                result = await this.loyaltyService.findById(id);
            } else {
                const { filter, options } = this.loyaltyService.generateFilter({
                    filters: reqData,
                });
                result = await this.loyaltyService.findOne(filter, options);
            }

            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Loyalty record fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };

    /**
     * Get All (Standard)
     */
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = this.loyaltyService.generateFilter({
                filters: reqData,
            });

            const result = await this.loyaltyService.findAll(filter, options);

            const response: IApiResponse<any[]> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Loyalty records fetched',
                data: result,
            };

            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };

    /**
     * Delete By Filter (Standard)
     */
    deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = req.body;
            const { filter } = this.loyaltyService.generateFilter({
                filters: reqData,
            });

            await this.loyaltyService.softDelete(filter, { userId: req.user?._id });

            const response: IApiResponse = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Loyalty record(s) deleted successfully',
            };

            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };
}
