import { Request, Response, NextFunction } from 'express';
import { inventoryAuditService } from '../services/concrete/inventoryAuditService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';

export class InventoryAuditController {
    getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = inventoryAuditService.generateFilter({
                filters: reqData,
            });
            
            // Default sort by createdAt desc if not provided
            if (!options.sort) {
                options.sort = { createdAt: -1 };
            }

            const { populate, ...restOptions } = options;
            const result = await inventoryAuditService.findAllWithPagination(filter, restOptions, populate);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Inventory audit logs fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await inventoryAuditService.findOne({ _id: req.params.id }, { populate: ['skuId', 'referenceId'] });
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Inventory audit detail fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };
}

export const inventoryAuditController = new InventoryAuditController();
