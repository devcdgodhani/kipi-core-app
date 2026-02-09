import { Request, Response, NextFunction } from 'express';
import { returnService } from '../services/concrete/returnService';
import { PaymentRefundService } from '../services/concrete/paymentRefundService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class ReturnController {
    
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await returnService.requestReturn({
                ...req.body,
                userId: req.user?._id
            });
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.CREATED.STATUS,
                code: HTTP_STATUS_CODE.CREATED.CODE,
                message: 'Return request created successfully',
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
            const response: IApiResponse<IPaginationData<any>> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Returns fetched successfully',
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
            const { filter, options } = returnService.generateFilter({
                filters: reqData,
            });
            const result = await returnService.findAll(filter, options);
            const response: IApiResponse<any[]> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Returns fetched successfully',
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
            const populate = [
                { path: 'orderId' },
                { path: 'productId', populate: { path: 'mainImage' } },
                { path: 'skuId', populate: { path: 'media.fileStorageId' } }
            ];

            if (id) {
                result = await returnService.findById(id, { populate });
            } else {
                const { filter, options } = returnService.generateFilter({
                    filters: reqData,
                });
                result = await returnService.findOne(filter, { ...options, populate });
            }

            if (!result) {
                return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
                    status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
                    code: HTTP_STATUS_CODE.NOTFOUND.CODE,
                    message: 'Return record not found'
                });
            }

            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Return details fetched successfully',
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
                message: 'Return status updated successfully',
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
            const result = await returnService.cancelReturn(id, userId.toString());
            const response: IApiResponse<any> = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Return request cancelled successfully',
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
            const { filter } = returnService.generateFilter({
                filters: reqData,
            });

            await returnService.softDelete(filter, { userId: req.user?._id });

            const response: IApiResponse = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Return record(s) deleted successfully',
            };

            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };

    syncRefundStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const ret = await returnService.findById(id);
            if (!ret) {
                throw new Error('Return record not found');
            }

            // Find latest refund for this order/payment
            const refundService = new PaymentRefundService();
            const refunds = await refundService.getRefundsByOrderId((ret.orderId as any)?._id || ret.orderId);
            const refund = refunds.length > 0 ? refunds[0] : null;
 
            if (!refund) {
                throw new Error('No refund record found for this return');
            }
 
            const status = await refundService.fetchRefundStatus((refund as any)._id.toString());

            const response: IApiResponse = {
                status: HTTP_STATUS_CODE.OK.STATUS,
                code: HTTP_STATUS_CODE.OK.CODE,
                message: 'Refund status synced successfully',
                data: status
            };

            return res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    };
}
