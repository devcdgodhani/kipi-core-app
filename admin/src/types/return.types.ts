export const RETURN_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    PICKED_UP: 'PICKED_UP',
    RECEIVED: 'RECEIVED',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
} as const;

export type RETURN_STATUS = (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];

export const RETURN_REASON = {
    DEFECTIVE: 'DEFECTIVE',
    WRONG_ITEM: 'WRONG_ITEM',
    QUALITY_ISSUE: 'QUALITY_ISSUE',
    SIZE_FIT_ISSUE: 'SIZE_FIT_ISSUE',
    NOT_NEED_ANYMORE: 'NOT_NEED_ANYMORE',
    OTHER: 'OTHER'
} as const;

export type RETURN_REASON = (typeof RETURN_REASON)[keyof typeof RETURN_REASON];

export interface IReturnItem {
    skuId: string;
    quantity: number;
    price: number;
    reason: RETURN_REASON;
    description?: string;
    images?: string[];
}

export interface IReturn {
    _id: string;
    orderId: any;
    userId: any;
    returnNumber: string;
    items: IReturnItem[];
    status: RETURN_STATUS;
    totalRefundAmount: number;
    refundStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
    refundTransactionId?: string;
    pickupAddress?: any;
    timeline: {
        status: RETURN_STATUS;
        timestamp: string;
        message: string;
    }[];
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReturnFilters {
    status?: RETURN_STATUS;
    userId?: string;
    orderId?: string;
    search?: string;
}
