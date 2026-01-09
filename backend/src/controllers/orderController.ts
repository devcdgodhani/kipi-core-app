import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { OrderService } from '../services/concrete/orderService';
import { PaymentService } from '../services/concrete/PaymentService';
import { PaymentRefundService } from '../services/concrete/PaymentRefundService';
import { TOrderCreateReq, TOrderRes, TOrderListPaginationRes } from '../types/order';
import { IApiResponse, IPaginationData } from '../interfaces';

export default class OrderController {
  private orderService = new OrderService();

  /*********** Create Order ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: TOrderCreateReq = req.body;
      const userId = req.user?._id; 

      const newOrder = await this.orderService.createOrder(reqData, userId);

      const response: TOrderRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Order created successfully',
        data: newOrder,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get My Orders (Customer) ***********/
  getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const reqData: any = { ...req.query, ...req.body };
      
      const { filter, options } = this.orderService.generateFilter({
        filters: reqData,
      });

      const orderList = await this.orderService.getMyOrders(userId as any, filter, options);

      const response: TOrderListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Orders fetched successfully',
        data: orderList as any
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get One Order (Standard) ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const reqData = { ...req.query, ...req.body };
      
      let order;
      if (id) {
        order = await this.orderService.findById(id);
      } else {
        const { filter, options } = this.orderService.generateFilter({
          filters: reqData,
        });
        order = await this.orderService.findOne(filter, options);
      }
      
      if (!order) {
        return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
          status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
          code: HTTP_STATUS_CODE.NOTFOUND.CODE,
          message: 'Order not found'
        });
      }

      const response: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Order fetched successfully',
        data: order
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Get All Orders (Standard) ***********/
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.orderService.generateFilter({
        filters: reqData,
      });

      const orderList = await this.orderService.findAll(filter, options);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'All orders fetched successfully',
        data: orderList,
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
      const { filter, options } = this.orderService.generateFilter({
        filters: reqData,
      });

      const orderList = await this.orderService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<any>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Orders fetched successfully',
        data: orderList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Specific Order Status (Admin) ***********/
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { orderStatus } = req.body;
      const userId = req.user?._id;

      await this.orderService.updateOrderStatus(id, orderStatus, userId);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Order status updated successfully',
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

      await this.orderService.updateOne({ _id: id } as any, updateData, { userId });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Order updated successfully',
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
      const { filter } = this.orderService.generateFilter({
        filters: reqData,
      });

      await this.orderService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Order(s) deleted successfully',
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  simulateLogistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.orderService.simulateLogisticsUpdate(id);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Logistics update simulated successfully',
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  syncPaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }

      // Find relevant payment
      const paymentService = new PaymentService();
      const payments = await paymentService.getPaymentsByOrderId(id);
      const payment = payments.length > 0 ? payments[0] : null;
      
      if (!payment) {
        throw new Error('No payment record found for this order');
      }

      const status = await paymentService.fetchPaymentStatus((payment as any)._id.toString());

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payment status synced successfully',
        data: status
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getPaymentsByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const paymentService = new PaymentService();
      const payments = await paymentService.getPaymentsByOrderId(id);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Payments fetched successfully',
        data: payments
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getRefundsByOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const refundService = new PaymentRefundService();
      const refunds = await refundService.getRefundsByOrderId(id);

      const response: IApiResponse<any[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Refunds fetched successfully',
        data: refunds
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
