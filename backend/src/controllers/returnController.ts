import { Request, Response, NextFunction } from 'express';
import { returnService } from '../services/concrete/returnService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';

export class ReturnController {
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await returnService.requestReturn({
                ...req.body,
                userId: (req as any).user?._id
            });
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.CREATED.STATUS,
                code: HTTP_STATUS_CODE.CREATED.CODE,
                message: 'Return request created',
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
            const { filter, options } = returnService.generateFilter({
                filters: reqData,
            });
            const result = await returnService.findAllWithPagination(filter, options);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Returns fetched',
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
            const result = await returnService.updateReturnStatus(id, status, adminNotes);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Return status updated',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await returnService.findById(req.params.id);
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Return details fetched',
                data: result
            };
            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };
}

export const returnController = new ReturnController();
