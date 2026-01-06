import { Request, Response, NextFunction } from 'express';
import { stockLedgerService } from '../services/concrete/stockLedgerService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';

export class StockLedgerController {
    getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = stockLedgerService.generateFilter({
                filters: reqData,
            });
            
            // Default sort by createdAt desc if not provided
            if (!options.sort) {
                options.sort = { createdAt: -1 };
            }

            options.populate = [
                { path: 'skuId', select: 'skuName skuCode' },
                { path: 'productId', select: 'name' }
            ];

            const result = await stockLedgerService.findAllWithPagination(filter, options);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Stock ledger logs fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await stockLedgerService.findOne({ _id: req.params.id }, { populate: ['skuId', 'productId', 'referenceId'] });
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Stock ledger detail fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };
}

export const stockLedgerController = new StockLedgerController();
