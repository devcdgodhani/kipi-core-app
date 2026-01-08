import { Document, Types } from 'mongoose';

export type StockLedgerTransactionType = 
  | 'ORDER_FULFILLMENT' 
  | 'ORDER_CANCEL' 
  | 'LOT_INWARD' 
  | 'ADMIN_ADJUSTMENT' 
  | 'RETURN_RESTOCK' 
  | 'RTO_RESTOCK'
  | 'EXCHANGE_DEDUCTION'
  | 'EXCHANGE_RESTOCK'
  | 'STOCK_ADJUSTMENT';

export type StockLedgerReferenceType = 'ORDER' | 'LOT' | 'USER' | 'RETURN' | 'STOCK_ADJUSTMENT';

export interface IStockLedgerAttributes {
  skuId: Types.ObjectId;
  productId?: Types.ObjectId;
  transactionType: StockLedgerTransactionType;
  changeQuantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: Types.ObjectId;
  referenceType?: StockLedgerReferenceType;
  reason?: string;
  createdAt?: Date;
}

export interface IStockLedgerDocument extends IStockLedgerAttributes, Document {}
