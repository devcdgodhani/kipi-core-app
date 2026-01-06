import { Request, Response, NextFunction } from 'express';
import { exchangeService } from '../services/concrete/exchangeService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class ExchangeController {
    
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await exchangeService.requestExchange({
                ...req.body,
                userId: req.user?._id
            });
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.CREATED.STATUS,
                code: HTTP_STATUS_CODE.CREATED.CODE,
                message: 'Exchange request created successfully',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = exchangeService.generateFilter({
                filters: reqData,
            });
            const result = await exchangeService.findAllWithPagination(filter, options);
            const response: IApiResponse<IPaginationData<any>> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchanges fetched successfully',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = { ...req.query, ...req.body };
            const { filter, options } = exchangeService.generateFilter({
                filters: reqData,
            });
            const result = await exchangeService.findAll(filter, options);
            const response: IApiResponse<any[]> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchanges fetched successfully',
                data: result,
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const reqData = { ...req.query, ...req.body };
            
            let result;
            if (id) {
                result = await exchangeService.findById(id);
            } else {
                const { filter, options } = exchangeService.generateFilter({
                    filters: reqData,
                });
                result = await exchangeService.findOne(filter, options);
            }

            if (!result) {
                return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
                    status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
                    code: HTTP_STATUS_CODE.NOTFOUND.CODE,
                    message: 'Exchange record not found'
                });
            }

            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchange details fetched successfully',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { status, adminNotes } = req.body;
            const result = await exchangeService.updateExchangeStatus(id, status, adminNotes);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchange status updated successfully',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    cancel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?._id;
            const result = await exchangeService.cancelExchange(id, userId.toString());
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchange request cancelled successfully',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reqData = req.body;
            const { filter } = exchangeService.generateFilter({
                filters: reqData,
            });

            await exchangeService.softDelete(filter, { userId: req.user?._id });

            const response: IApiResponse = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Exchange record(s) deleted successfully',
            };

            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };
}
