import { Schema, model } from 'mongoose';
import { IReturn } from '../../../interfaces/return';
import { RETURN_STATUS, RETURN_REASON } from '../../../constants/return';

const returnItemSchema = new Schema({
    skuId: { type: Schema.Types.ObjectId, ref: 'Sku', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    reason: { type: String, enum: Object.values(RETURN_REASON), required: true },
    description: { type: String },
    images: [{ type: String }]
}, { _id: false });

const returnSchema = new Schema<IReturn>({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    returnNumber: { type: String, required: true, unique: true },
    items: [returnItemSchema],
    status: { 
        type: String, 
        enum: Object.values(RETURN_STATUS), 
        default: RETURN_STATUS.PENDING,
        index: true 
    },
    totalRefundAmount: { type: Number, required: true },
    refundStatus: { 
        type: String, 
        enum: ['PENDING', 'PROCESSED', 'FAILED'], 
        default: 'PENDING' 
    },
    refundTransactionId: { type: String },
    pickupAddress: { type: Schema.Types.Mixed },
    timeline: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        message: { type: String }
    }],
    adminNotes: { type: String }
}, {
    timestamps: true,
    versionKey: false
});

export const ReturnModel = model<IReturn>('Return', returnSchema);
