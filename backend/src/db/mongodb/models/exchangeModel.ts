import { Schema, model, Document } from 'mongoose';

export interface IExchangeAttributes {
  orderId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  items: {
    originalSkuId: Schema.Types.ObjectId;
    exchangeSkuId: Schema.Types.ObjectId;
    quantity: number;
    reason: string;
    condition: string;
  }[];
  status: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'RECEIVED' | 'INSPECTED' | 'NEW_ORDER_CREATED' | 'CANCELLED';
  logisticsId?: Schema.Types.ObjectId;
  replacementOrderId?: Schema.Types.ObjectId;
  adminNotes?: string;
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

export interface IExchangeDocument extends IExchangeAttributes, Document {
  createdAt: Date;
  updatedAt: Date;
}

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
