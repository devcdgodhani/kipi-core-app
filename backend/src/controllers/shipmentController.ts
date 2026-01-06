import { Request, Response, NextFunction } from 'express';
import { ShipmentService } from '../services/concrete/shipmentService';
import { logisticsService } from '../services/concrete/logisticsService';
import { trackingService } from '../services/concrete/trackingService';
import { HTTP_STATUS_CODE, SHIPMENT_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { IShipmentAttributes } from '../interfaces/shipment';

export class ShipmentController {
  shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, courierId } = req.body;
      const result = await logisticsService.createShipment(orderId, courierId);
      
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: SHIPMENT_MESSAGES.SUCCESS.CREATED,
        data: result
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.shipmentService.findAllWithPagination(req.body);
      
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipments fetched successfully',
        data: result
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.shipmentService.findById(id);
      
      if (!result) {
        // Let the error middleware handle it or return custom error response
        const response: IApiResponse<null> = {
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: SHIPMENT_MESSAGES.ERROR.NOT_FOUND,
          data: null
        };
        return res.status(response.status).json(response);
      }

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipment found successfully',
        data: result
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  track = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { awb } = req.params;
      const result = await trackingService.getTrackingByAWB(awb);
      
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SHIPMENT_MESSAGES.SUCCESS.TRACKING_FETCHED,
        data: result
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  checkServiceability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await logisticsService.checkServiceability(req.body);
      
      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Serviceability checked successfully',
        data: result
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await logisticsService.cancelShipment(id);
      
      const response: IApiResponse<null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: SHIPMENT_MESSAGES.SUCCESS.CANCELLED,
        data: null
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
