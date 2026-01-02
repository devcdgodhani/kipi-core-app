import { Schema, model, Document, Types } from 'mongoose';

export interface IInventoryAudit extends Document {
    skuId: Types.ObjectId;
    transactionType: 'ORDER_FULFILLMENT' | 'ORDER_CANCEL' | 'LOT_INWARD' | 'ADMIN_ADJUSTMENT' | 'RETURN_RESTOCK';
    changeQuantity: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId?: Types.ObjectId; // OrderId or LotId or AdminId
    referenceType?: 'ORDER' | 'LOT' | 'USER';
    reason?: string;
    createdAt: Date;
}

const inventoryAuditSchema = new Schema<IInventoryAudit>({
    skuId: { type: Schema.Types.ObjectId, ref: 'Sku', required: true, index: true },
    transactionType: { 
        type: String, 
        required: true, 
        enum: ['ORDER_FULFILLMENT', 'ORDER_CANCEL', 'LOT_INWARD', 'ADMIN_ADJUSTMENT', 'RETURN_RESTOCK'],
        index: true 
    },
    changeQuantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId, index: true },
    referenceType: { type: String, enum: ['ORDER', 'LOT', 'USER'] },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
}, {
    timestamps: false,
    versionKey: false
});

// Compound index for quick lookups
inventoryAuditSchema.index({ skuId: 1, createdAt: -1 });

export const InventoryAuditModel = model<IInventoryAudit>('InventoryAudit', inventoryAuditSchema);
