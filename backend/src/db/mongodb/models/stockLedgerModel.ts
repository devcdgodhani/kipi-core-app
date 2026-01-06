import { Schema, model, Document, Types } from 'mongoose';

export interface IStockLedger extends Document {
    skuId: Types.ObjectId;
    productId?: Types.ObjectId;
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
    referenceId?: Types.ObjectId; // OrderId or LotId or AdminId
    referenceType?: 'ORDER' | 'LOT' | 'USER' | 'RETURN' | 'STOCK_ADJUSTMENT';
    reason?: string;
    createdAt: Date;
}

const stockLedgerSchema = new Schema<IStockLedger>({
    skuId: { type: Schema.Types.ObjectId, ref: 'Sku', index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
    transactionType: { 
        type: String, 
        required: true, 
        enum: [
            'ORDER_FULFILLMENT', 
            'ORDER_CANCEL', 
            'LOT_INWARD', 
            'ADMIN_ADJUSTMENT', 
            'RETURN_RESTOCK', 
            'RTO_RESTOCK',
            'EXCHANGE_DEDUCTION',
            'EXCHANGE_RESTOCK',
            'STOCK_ADJUSTMENT'
        ],
        index: true 
    },
    changeQuantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId, index: true },
    referenceType: { type: String, enum: ['ORDER', 'LOT', 'USER', 'RETURN', 'STOCK_ADJUSTMENT'] },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
}, {
    timestamps: false,
    versionKey: false
});

// Compound index for quick lookups
stockLedgerSchema.index({ skuId: 1, createdAt: -1 });
 stockLedgerSchema.index({ productId: 1, createdAt: -1 });

export const StockLedgerModel = model<IStockLedger>('StockLedger', stockLedgerSchema);
