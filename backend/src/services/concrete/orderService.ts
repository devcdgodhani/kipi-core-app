import { FilterQuery, Model } from 'mongoose';
import { MongooseCommonService } from './mongooseCommonService';
import { OrderModel } from '../../db/mongodb';
import { IOrder, TOrderCreateReq } from '../../types/order';
import { CouponService } from './couponService';
import { COUPON_TYPE } from '../../constants/coupon';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class OrderService extends MongooseCommonService<IOrder, any> {
  private couponService = new CouponService();

  constructor() {
    super(OrderModel);
  }

  generateOrderNumber = (): string => {
    const date = new Date();
    const prefix = 'ORD';
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${random}`;
  };

  createOrder = async (orderData: TOrderCreateReq, userId: any): Promise<IOrder> => {
    // 1. Calculate Subtotal
    let subTotal = 0;
    orderData.items.forEach(item => {
      subTotal += item.price * item.quantity;
    });

    let discountAmount = 0;
    let couponCode = orderData.couponCode;

    // 2. Handle Coupon
    if (couponCode) {
      const coupon = await this.couponService.validateCoupon(couponCode, subTotal, userId);
      
      if (coupon.type === COUPON_TYPE.PERCENTAGE) {
        discountAmount = (subTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.value;
      }

      // Increment coupon usage count
      await this.couponService.updateOne(
        { _id: coupon._id }, 
        { $inc: { usageCount: 1 } }
      );
    }

    // 3. Calculate Final Total
    const tax = orderData.tax || 0;
    const shippingCost = orderData.shippingCost || 0;
    const totalAmount = subTotal + tax + shippingCost - discountAmount;

    // 4. Generate Order Number
    const orderNumber = this.generateOrderNumber();

    // 5. Create Order
    const newOrder = await this.create({
      ...orderData,
      userId,
      orderNumber,
      subTotal,
      discountAmount,
      totalAmount,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING'
    } as any);

    return newOrder;
  };
  
  getMyOrders = async (userId: string, filter: any, options: any) => {
    const userFilter = { ...filter, userId };
    return this.findAllWithPagination(userFilter, options);
  };

  updateOrderStatus = async (orderId: string, status: string, userId: any) => {
    const order = await this.findById(orderId);
    if (!order) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Order not found');
    }

    const currentStatus = order.orderStatus;
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['RETURNED'],
      CANCELLED: [],
      RETURNED: []
    };

    if (currentStatus !== status && !allowedTransitions[currentStatus]?.includes(status)) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE, 
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 
        `Cannot transition order from ${currentStatus} to ${status}`
      );
    }
    
    return this.updateOne({ _id: orderId }, { orderStatus: status }, { userId });
  };
}
