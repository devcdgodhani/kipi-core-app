import { Request, Response, NextFunction } from 'express';
import { shipmentService } from '../services/concrete/shipmentService';
import { logisticsService } from '../services/concrete/logisticsService';
import { trackingService } from '../services/concrete/trackingService';
import { HTTP_STATUS_CODE, SHIPMENT_MESSAGES } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';
import { IShipmentAttributes } from '../interfaces/shipment';

export class ShipmentController {
  private get shipmentService() { return shipmentService; }

  /*********** Create ***********/
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

  /*********** Get One (Standard) ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query, ...req.body };
      
      let shipment;
      if (id) {
        shipment = await this.shipmentService.findById(id);
      } else {
        const { filter, options } = this.shipmentService.generateFilter({
          filters: reqData,
        });
        shipment = await this.shipmentService.findOne(filter, options);
      }
      
      if (!shipment) {
        const errorResponse: IApiResponse = {
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: SHIPMENT_MESSAGES.ERROR.NOT_FOUND
        };
        return res.status(errorResponse.status).json(errorResponse);
      }

      const response: IApiResponse<IShipmentAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipment fetched successfully',
        data: shipment
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get All (Standard) ***********/
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.shipmentService.generateFilter({
        filters: reqData,
      });

      const shipmentList = await this.shipmentService.findAll(filter, options);

      const response: IApiResponse<IShipmentAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'All shipments fetched successfully',
        data: shipmentList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get With Pagination (Standard) ***********/
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.shipmentService.generateFilter({
        filters: reqData,
      });

      const shipmentList = await this.shipmentService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IShipmentAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipments fetched successfully',
        data: shipmentList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update By ID (Standard) ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?._id;

      await this.shipmentService.updateOne({ _id: id } as any, updateData, { userId });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipment updated successfully',
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete By Filter (Standard) ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.shipmentService.generateFilter({
        filters: reqData,
      });

      await this.shipmentService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Shipment(s) deleted successfully',
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Tracking ***********/
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

  /*********** Serviceability ***********/
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

  /*********** Cancellation ***********/
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await logisticsService.cancelShipment(id);
      
      const response: IApiResponse<any> = {
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

export const shipmentController = new ShipmentController();
