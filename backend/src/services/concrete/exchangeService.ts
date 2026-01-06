import { ExchangeModel, IExchangeAttributes, IExchangeDocument } from '../../db/mongodb/models/exchangeModel';
import { MongooseCommonService } from './mongooseCommonService';
import { IExchangeService } from '../contracts/exchangeServiceInterface';
import { OrderModel, SkuModel } from '../../db/mongodb';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { UpdateWriteOpResult } from 'mongoose';

export class ExchangeService extends MongooseCommonService<IExchangeAttributes, IExchangeDocument> implements IExchangeService {
  constructor() {
    super(ExchangeModel);
  }

  async requestExchange(data: any): Promise<IExchangeAttributes> {
    const { orderId, items, userId } = data;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Original order not found');
    }

    if (order.userId.toString() !== userId.toString()) {
        throw new ApiError(HTTP_STATUS_CODE.FORBIDDEN.CODE, HTTP_STATUS_CODE.FORBIDDEN.STATUS, 'Unauthorized access to order');
    }

    // Basic validation of items
    for (const item of items) {
        const orderItem = order.items.find(oi => oi.skuId?.toString() === item.originalSkuId.toString());
        if (!orderItem) {
            throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Item ${item.originalSkuId} not found in order`);
        }
        
        const exchangeSku = await SkuModel.findById(item.exchangeSkuId);
        if (!exchangeSku) {
            throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, `Exchange SKU ${item.exchangeSkuId} not found`);
        }
    }

    return this.create({
      ...data,
      status: 'REQUESTED'
    }, { userId });
  }

  async updateExchangeStatus(id: string, status: any, adminNotes?: string): Promise<UpdateWriteOpResult | null> {
    const exchange = await this.findById(id);
    if (!exchange) {
        throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Exchange request not found');
    }

    const updateData: any = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    return this.updateOne({ _id: id } as any, updateData);
  }

  async cancelExchange(id: string, userId: string): Promise<UpdateWriteOpResult | null> {
    const exchange = await this.findOne({ _id: id, userId });
    if (!exchange) {
        throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Exchange request not found or unauthorized');
    }

    if (exchange.status !== 'REQUESTED') {
        throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 'Only requested exchanges can be cancelled');
    }

    return this.updateOne({ _id: id } as any, { status: 'CANCELLED' });
  }
}

export const exchangeService = new ExchangeService();
