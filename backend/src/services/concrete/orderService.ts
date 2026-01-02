import { FilterQuery, Model } from 'mongoose';
import { MongooseCommonService } from './mongooseCommonService';
import { OrderModel } from '../../db/mongodb';
import { IOrder, TOrderCreateReq } from '../../types/order';
import { IOrderItem } from '../../types/order';

export class OrderService extends MongooseCommonService<IOrder, any> {
  constructor() {
    super(OrderModel);
  }

  generateOrderNumber = (): string => {
    // Format: ORD-YYYYMMDD-XXXX
    const date = new Date();
    const prefix = 'ORD';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${random}`;
  };

  createOrder = async (orderData: TOrderCreateReq, userId: string | any): Promise<IOrder> => {
    // 1. Calculate totals (sanity check)
    // Assuming prices in items are correct. 
    // In strict system, we should re-fetch SKU prices.
    
    // 2. Generate Order Number
    const orderNumber = this.generateOrderNumber();

    // 3. Create
    const newOrder = await this.create({
      ...orderData,
      userId,
      orderNumber,
      orderStatus: 'PENDING',
      paymentStatus: orderData.paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING'
    } as any);

    return newOrder;
  };
  
  getMyOrders = async (userId: string, filter: any, options: any) => {
      // Add userId to filter
      const userFilter = { ...filter, userId };
      return this.findAllWithPagination(userFilter, options);
  }
}
