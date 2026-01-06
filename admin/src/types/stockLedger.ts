export interface IStockLedger {
    _id: string;
    skuId: {
        _id: string;
        skuName: string;
        skuCode: string;
        productId?: {
            name: string;
        };
    };
    productId?: {
        _id: string;
        name: string;
    };
    transactionType: 
        | 'ORDER_FULFILLMENT' 
        | 'ORDER_CANCEL' 
        | 'LOT_INWARD' 
        | 'ADMIN_ADJUSTMENT' 
        | 'RETURN_RESTOCK'
        | 'RTO_RESTOCK'
        | 'EXCHANGE_DEDUCTION'
        | 'EXCHANGE_RESTOCK'
        | 'STOCK_ADJUSTMENT';
    changeQuantity: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId?: any;
    referenceType?: 'ORDER' | 'LOT' | 'USER' | 'RETURN' | 'STOCK_ADJUSTMENT';
    reason?: string;
    createdAt: string;
}

export interface IStockLedgerFilters {
    page?: number;
    limit?: number;
    search?: string;
    skuId?: string;
    productId?: string;
    transactionType?: string;
    referenceType?: string;
}
