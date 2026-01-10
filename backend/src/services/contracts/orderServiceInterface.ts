import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IOrderAttributes, IOrderDocument } from '../../interfaces';
import { TOrderCreateReq } from '../../types/order';

export interface IOrderService extends IMongooseCommonService<IOrderAttributes, IOrderDocument> {
  createOrder(orderData: TOrderCreateReq, userId: string): Promise<IOrderAttributes>;
  getMyOrders(userId: string, filter: any, options: any): Promise<any>;
  updateOrderStatus(orderId: string, status: string, userId: string): Promise<IOrderAttributes | null>;
  simulateLogisticsUpdate(orderId: string): Promise<IOrderAttributes | null>;
  generateOrderNumber(): string;
}
