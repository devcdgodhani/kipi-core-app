import { SkuService } from './skuService';
import { ProductService } from './productService';
import { stockLedgerService } from './stockLedgerService';
import { LotModel } from '../../db/mongodb/models/lotModel';
import { ADJUST_QUANTITY_TYPE, LOT_STATUS } from '../../constants';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class InventoryService {
  private skuService = new SkuService();
  private productService = new ProductService();
  /**
   * Deducts stock for a given SKU or Product.
   * Logs an audit trail for the transaction in the Stock Ledger.
   */
  async deductStock(params: {
    skuId?: string;
    productId?: string;
    quantity: number;
    referenceId: string;
    referenceType: 'ORDER' | 'STOCK_ADJUSTMENT';
    reason: string;
  }): Promise<void> {
    const { skuId, productId, quantity, referenceId, referenceType, reason } = params;

    if (skuId) {
      const sku = await this.skuService.findById(skuId);
      if (!sku) throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'SKU not found');

      if ((sku as any).quantity < quantity) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          `Insufficient stock for SKU: ${(sku as any).skuCode || skuId}`
        );
      }

      const previousQuantity = (sku as any).quantity;
      const newQuantity = previousQuantity - quantity;
      
      await this.skuService.updateOne({ _id: skuId }, { quantity: newQuantity });

      // Deduct from Lots (FIFO)
      await this.deductFromLots({
        skuId,
        quantity,
        reason,
        date: new Date()
      });

      await stockLedgerService.logAdjustment({
        skuId,
        transactionType: 'ORDER_FULFILLMENT',
        changeQuantity: -quantity,
        previousQuantity,
        newQuantity: newQuantity,
        referenceId,
        referenceType,
        reason
      });
    } else if (productId) {
      const product = await this.productService.findById(productId);
      if (!product) throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Product not found');

      if (((product as any).stock || 0) < quantity) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          `Insufficient stock for Product: ${(product as any).name}`
        );
      }

      const previousQuantity = (product as any).stock || 0;
      const newQuantity = previousQuantity - quantity;

      await this.productService.updateOne({ _id: productId }, { stock: newQuantity });

      // Deduct from Lots (FIFO)
      await this.deductFromLots({
        productId,
        quantity,
        reason,
        date: new Date()
      });

      await stockLedgerService.logAdjustment({
        productId,
        transactionType: 'ORDER_FULFILLMENT',
        changeQuantity: -quantity,
        previousQuantity,
        newQuantity: newQuantity,
        referenceId,
        referenceType,
        reason
      });
    }
  }

  /**
   * Restocks items back to inventory.
   * Logs an audit trail for the transaction in the Stock Ledger.
   */
  async restock(params: {
    skuId?: string;
    productId?: string;
    quantity: number;
    referenceId: string;
    referenceType: 'ORDER' | 'RETURN' | 'STOCK_ADJUSTMENT' | 'RTO';
    reason: string;
  }): Promise<void> {
    const { skuId, productId, quantity, referenceId, referenceType, reason } = params;

    if (skuId) {
      const sku = await this.skuService.findById(skuId);
      if (sku) {
        const previousQuantity = (sku as any).quantity;
        const newQuantity = previousQuantity + quantity;
        await this.skuService.updateOne({ _id: skuId }, { quantity: newQuantity });

        // Restock to Lots
        await this.restockLots({
          skuId,
          quantity,
          reason,
          date: new Date()
        });

        let transactionType: any = 'ORDER_CANCEL';
        if (referenceType === 'RETURN') transactionType = 'RETURN_RESTOCK';
        if (referenceType === 'RTO') transactionType = 'RTO_RESTOCK';

        await stockLedgerService.logAdjustment({
          skuId,
          transactionType,
          changeQuantity: quantity,
          previousQuantity,
          newQuantity: newQuantity,
          referenceId,
          referenceType: referenceType === 'RETURN' ? 'RETURN' : 'ORDER',
          reason
        });
      }
    } else if (productId) {
      const product = await this.productService.findById(productId);
      if (product) {
        const previousQuantity = (product as any).stock || 0;
        const newQuantity = previousQuantity + quantity;
        await this.productService.updateOne({ _id: productId }, { stock: newQuantity });

        // Restock to Lots
        await this.restockLots({
          productId,
          quantity,
          reason,
          date: new Date()
        });

        let transactionType: any = 'ORDER_CANCEL';
        if (referenceType === 'RETURN') transactionType = 'RETURN_RESTOCK';
        if (referenceType === 'RTO') transactionType = 'RTO_RESTOCK';

        await stockLedgerService.logAdjustment({
          productId,
          transactionType,
          changeQuantity: quantity,
          previousQuantity,
          newQuantity: newQuantity,
          referenceId,
          referenceType: referenceType === 'RETURN' ? 'RETURN' : 'ORDER',
          reason
        });
      }
    }
  }
  
  /**
   * Helper: Deduct stock from active Lots (FIFO)
   */
  private async deductFromLots(params: {
      skuId?: string;
      productId?: string;
      quantity: number;
      reason: string;
      date: Date;
  }) {
      const { skuId, productId, quantity, reason, date } = params;
      let remainingToDeduct = quantity;

      // Find Lot IDs via SKU relationship
      let lotIds: any[] = [];
      
      if (skuId) {
          const sku = await this.skuService.findById(skuId);
          if (sku && (sku as any).lotId) {
              lotIds = [(sku as any).lotId];
          }
      } else if (productId) {
          const skus = await this.skuService.findAll({ productId } as any);
          lotIds = skus
              .map((s: any) => s.lotId)
              .filter((id: any) => id != null);
      }

      if (lotIds.length === 0) {
          console.warn(`[Inventory] Warning: No lots found for ${skuId ? 'SKU' : 'Product'}`);
          return;
      }

      const query: any = { 
          _id: { $in: lotIds },
          status: LOT_STATUS.ACTIVE, 
          remainingQuantity: { $gt: 0 } 
      };
      
      // FIFO: Sort by creation date (or startDate)
      const lots = await LotModel.find(query).sort({ startDate: 1, createdAt: 1 });

      for (const lot of lots) {
          if (remainingToDeduct <= 0) break;

          const available = lot.remainingQuantity;
          const deduct = Math.min(available, remainingToDeduct);
          
          lot.adjustQuantity = lot.adjustQuantity || [];
          lot.adjustQuantity.push({
              quantity: deduct,
              type: ADJUST_QUANTITY_TYPE.SALES,
              reason,
              date
          });
          
          await lot.save();
          remainingToDeduct -= deduct;
      }
      
      if (remainingToDeduct > 0) {
          console.warn(`[Inventory] Warning: Could not deduct full quantity from Lots. Missing: ${remainingToDeduct}`);
      }
  }

  /**
   * Helper: Restock to Lots (LIFO or any active)
   */
  private async restockLots(params: {
      skuId?: string;
      productId?: string;
      quantity: number;
      reason: string;
      date: Date;
  }) {
      const { skuId, productId, quantity, reason, date } = params;
      
      // Find Lot IDs via SKU relationship
      let lotIds: any[] = [];
      
      if (skuId) {
          const sku = await this.skuService.findById(skuId);
          if (sku && (sku as any).lotId) {
              lotIds = [(sku as any).lotId];
          }
      } else if (productId) {
          const skus = await this.skuService.findAll({ productId } as any);
          lotIds = skus
              .map((s: any) => s.lotId)
              .filter((id: any) => id != null);
      }

      if (lotIds.length === 0) {
          console.warn(`[Inventory] Warning: No lots found for ${skuId ? 'SKU' : 'Product'} to restock`);
          return;
      }

      const query: any = { 
          _id: { $in: lotIds },
          status: LOT_STATUS.ACTIVE 
      };

      // Find latest lot to restock (LIFOish) or just any active lot
      const lot = await LotModel.findOne(query).sort({ startDate: -1, createdAt: -1 });

      if (lot) {
           // We add negative adjustment to increase remainingQuantity?
           // No, remainingQuantity = quantity - adjustments. 
           // So to INCREASE remainingQuantity, we must remove an adjustment or add a "negative" adjustment?
           // Logic: remainingQuantity = quantity - sum(adjustments).
           // If we Add new adjustment with negative quantity, sum decreases, remainingQuantity increases.
           
           lot.adjustQuantity = lot.adjustQuantity || [];
           lot.adjustQuantity.push({
               quantity: -quantity, // Negative quantity to restore stock
               type: ADJUST_QUANTITY_TYPE.RETURN, 
               reason,
               date
           });
           await lot.save();
      } else {
          console.warn('[Inventory] Warning: No active lot found to restock items.');
      }
  }
}

export const inventoryService = new InventoryService();
