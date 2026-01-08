import { Schema, model } from 'mongoose';
import { IExchangeDocument } from '../../../interfaces/exchange';

const ExchangeSchema = new Schema<IExchangeDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      originalSkuId: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
      exchangeSkuId: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
      quantity: { type: Number, required: true },
      reason: { type: String, required: true },
      condition: { type: String }
    }],
    status: {
      type: String,
      enum: ['REQUESTED', 'APPROVED', 'PICKED_UP', 'RECEIVED', 'INSPECTED', 'NEW_ORDER_CREATED', 'CANCELLED'],
      default: 'REQUESTED'
    },
    logisticsId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    replacementOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    adminNotes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const ExchangeModel = model<IExchangeDocument>('Exchange', ExchangeSchema);
