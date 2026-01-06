import { SkuModel, ProductModel } from '../../db/mongodb';
import { stockLedgerService } from './stockLedgerService';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';

export class InventoryService {
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
      const sku = await SkuModel.findById(skuId);
      if (!sku) throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'SKU not found');

      if (sku.quantity < quantity) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          `Insufficient stock for SKU: ${sku.skuCode || skuId}`
        );
      }

      const previousQuantity = sku.quantity;
      sku.quantity -= quantity;
      await sku.save();

      await stockLedgerService.logAdjustment({
        skuId,
        transactionType: 'ORDER_FULFILLMENT',
        changeQuantity: -quantity,
        previousQuantity,
        newQuantity: sku.quantity,
        referenceId,
        referenceType,
        reason
      });
    } else if (productId) {
      const product = await ProductModel.findById(productId);
      if (!product) throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Product not found');

      if ((product.stock || 0) < quantity) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          `Insufficient stock for Product: ${product.name}`
        );
      }

      const previousQuantity = product.stock || 0;
      product.stock = previousQuantity - quantity;
      await product.save();

      await stockLedgerService.logAdjustment({
        productId,
        transactionType: 'ORDER_FULFILLMENT',
        changeQuantity: -quantity,
        previousQuantity,
        newQuantity: product.stock,
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
      const sku = await SkuModel.findById(skuId);
      if (sku) {
        const previousQuantity = sku.quantity;
        sku.quantity += quantity;
        await sku.save();

        let transactionType: any = 'ORDER_CANCEL';
        if (referenceType === 'RETURN') transactionType = 'RETURN_RESTOCK';
        if (referenceType === 'RTO') transactionType = 'RTO_RESTOCK';

        await stockLedgerService.logAdjustment({
          skuId,
          transactionType,
          changeQuantity: quantity,
          previousQuantity,
          newQuantity: sku.quantity,
          referenceId,
          referenceType: referenceType === 'RETURN' ? 'RETURN' : 'ORDER',
          reason
        });
      }
    } else if (productId) {
      const product = await ProductModel.findById(productId);
      if (product) {
        const previousQuantity = product.stock || 0;
        product.stock = previousQuantity + quantity;
        await product.save();

        let transactionType: any = 'ORDER_CANCEL';
        if (referenceType === 'RETURN') transactionType = 'RETURN_RESTOCK';
        if (referenceType === 'RTO') transactionType = 'RTO_RESTOCK';

        await stockLedgerService.logAdjustment({
          productId,
          transactionType,
          changeQuantity: quantity,
          previousQuantity,
          newQuantity: product.stock,
          referenceId,
          referenceType: referenceType === 'RETURN' ? 'RETURN' : 'ORDER',
          reason
        });
      }
    }
  }
}

export const inventoryService = new InventoryService();
