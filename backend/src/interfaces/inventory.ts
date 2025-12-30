import { Document, Types } from 'mongoose';

export interface IInventoryAttributes {
  sku: Types.ObjectId;
  totalAvailableStock: number;
  totalReservedStock: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  lastRestockedAt?: Date;
}

export interface IInventory extends Document, IInventoryAttributes {}
