import { SkuService } from './skuService';
import { ProductService } from './productService';
import { stockLedgerService } from './stockLedgerService';
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
}

export const inventoryService = new InventoryService();
