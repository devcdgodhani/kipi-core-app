import { Document, Types } from 'mongoose';
import { RETURN_STATUS, RETURN_REASON } from '../constants/return';

export interface IReturnItem {
    skuId: Types.ObjectId;
    quantity: number;
    price: number;
    reason: RETURN_REASON;
    description?: string;
    images?: string[];
}

export interface IReturn extends Document {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    returnNumber: string;
    items: IReturnItem[];
    status: RETURN_STATUS;
    totalRefundAmount: number;
    refundStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
    refundTransactionId?: string;
    pickupAddress?: any;
    timeline: {
        status: RETURN_STATUS;
        timestamp: Date;
        message: string;
    }[];
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
