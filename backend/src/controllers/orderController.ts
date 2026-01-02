import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { OrderService } from '../services/concrete/orderService';
import { TOrderCreateReq, TOrderRes, TOrderListPaginationRes } from '../types/order';
import { IApiResponse } from '../interfaces';

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

  /*********** Get My Orders ***********/
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

  /*********** Get One Order ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const { id } = req.params;
          const order = await this.orderService.findById(id);
          
          if (!order) {
              throw new Error("Order not found"); // Use proper error class if available
          }

          // Check if belongs to user?
          // if (order.userId !== req.user?._id) ...

          const response: TOrderRes = {
              status: HTTP_STATUS_CODE.OK.STATUS,
              code: HTTP_STATUS_CODE.OK.CODE,
              message: 'Order fetched successfully',
              data: order
          };
          return res.status(response.status).json(response);
      } catch (err) {
          return next(err);
      }
  }
}
