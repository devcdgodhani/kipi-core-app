import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IOrder } from '../../types/order';
import { IOrderDocument } from '../../db/mongodb/models/orderModel';

export interface IOrderService extends IMongooseCommonService<IOrder, IOrderDocument> {
  createOrder(orderData: any, userId: any): Promise<IOrder>;
  getMyOrders(userId: string, filter: any, options: any): Promise<any>;
  updateOrderStatus(orderId: string, status: string, userId: any): Promise<any>;
  simulateLogisticsUpdate(orderId: string): Promise<any>;
  generateOrderNumber(): string;
}

