import { NextFunction, Request, Response } from 'express';
import { pushNotificationService } from '../services/concrete/pushNotificationService';
import { PUSH_NOTIFICATION_SUCCESS_MESSAGES } from '../constants/pushNotification';
import { IPushNotificationAttributes } from '../interfaces/pushNotification';

export class PushNotificationController {
    // --- Private Getters ---
    private get service() {
        return pushNotificationService;
    }

    // --- CRUD Methods ---
    getOne = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findOne(req.body);
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.findAll(req.body);
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // req.body contains query and options
            const result = await this.service.findAllWithPagination(req.body.query || {}, req.body.options || {});
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.GET_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload: IPushNotificationAttributes = {
                ...req.body,
                createdBy: (req as any).user._id // Assuming auth middleware adds user
            };
            const result = await this.service.create(payload);
            res.status(201).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.CREATE_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.update({ _id: req.params.id }, req.body);
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.UPDATE_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.service.delete(req.body);
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.DELETE_SUCCESS,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    // --- Custom Methods ---

    sendNow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Logic to trigger immediate send typically involves updating status to PROCESSING
            // and relying on queue, or calling service directly if small scale.
            // For now, we'll mark it pending queue pickup or trigger service method if implemented.
            // Simplified: Update stats after triggering
            // TODO: Integrate with Queue
            res.status(200).json({
                success: true,
                message: PUSH_NOTIFICATION_SUCCESS_MESSAGES.SEND_SUCCESS
            });
        } catch (error) {
            next(error);
        }
    }

    registerDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token, platform } = req.body;
            await this.service.registerDevice((req as any).user._id, token, platform);
            res.status(200).json({
                success: true,
                message: 'Device registered successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    unregisterDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body;
            await this.service.unregisterDevice((req as any).user._id, token);
            res.status(200).json({
                success: true,
                message: 'Device unregistered successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export const pushNotificationController = new PushNotificationController();
