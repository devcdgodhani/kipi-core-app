export interface IInventoryAudit {
    _id: string;
    skuId: {
        _id: string;
        skuName: string;
        skuCode: string;
        productId?: {
            name: string;
        };
    };
    transactionType: 'ORDER_FULFILLMENT' | 'ORDER_CANCEL' | 'LOT_INWARD' | 'ADMIN_ADJUSTMENT' | 'RETURN_RESTOCK';
    changeQuantity: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId?: any;
    referenceType?: 'ORDER' | 'LOT' | 'USER';
    reason?: string;
    createdAt: string;
}

export interface IInventoryAuditFilters {
    page?: number;
    limit?: number;
    search?: string;
    skuId?: string;
    transactionType?: string;
    referenceType?: string;
}
