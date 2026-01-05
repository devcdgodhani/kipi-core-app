import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from '../services/concrete/loyaltyService';
import { UserModel } from '../db/mongodb';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';

export default class LoyaltyController {
    private loyaltyService = new LoyaltyService();

    /**
     * Get current user balance and ledger
     */
    getUserLoyalty = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const user = await UserModel.findById(userId).select('loyaltyPoints totalEarnedPoints');
            
            if (!user) {
                return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
                    status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
                    code: HTTP_STATUS_CODE.NOTFOUND.CODE,
                    message: 'User not found'
                });
            }

            const options = req.body?.options || {};
            const ledger = await this.loyaltyService.getUserLedger(userId.toString(), options);

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
     * Admin: Get all transactions with filters
     */
    getAdminLedger = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { filter = {}, options = {} } = req.body;
            const ledger = await this.loyaltyService.findAllWithPagination(filter, options);

            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Global ledger retrieved',
                data: ledger
            };
            return res.status(response.status).json(response);
        } catch (err) {
            return next(err);
        }
    };
}
