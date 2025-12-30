import InventoryModel from '../../db/mongodb/models/inventoryModel';
import LotModel from '../../db/mongodb/models/lotModel';
import StockMovementModel from '../../db/mongodb/models/stockMovementModel';
import { IInventory, IInventoryAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import { STOCK_MOVEMENT_TYPE } from '../../constants';
import mongoose from 'mongoose';

export class InventoryService extends MongooseCommonService<IInventoryAttributes, IInventory> {
  constructor() {
    super(InventoryModel);
  }

  async getStock(skuId: string) {
    return this.model.findOne({ sku: skuId, isDeleted: false }).exec();
  }

  async adjustStock(skuId: string, quantity: number, reason: string, lotId?: string, userId?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // If lotId provided, adjust specific lot
      if (lotId) {
        const lot = await LotModel.findById(lotId).session(session);
        if (!lot) {
          throw new Error('Lot not found');
        }
        lot.currentQuantity += quantity;
        if (lot.currentQuantity < 0) {
          throw new Error('Insufficient stock in lot');
        }
        await lot.save({ session });
      }

      // Update aggregate inventory
      const inventory = await this.model.findOneAndUpdate(
        { sku: skuId },
        { 
          $inc: { totalAvailableStock: quantity },
          $set: { lastRestockedAt: quantity > 0 ? new Date() : undefined }
        },
        { upsert: true, new: true, session }
      );

      // Record movement
      await StockMovementModel.create([{
        movementType: STOCK_MOVEMENT_TYPE.ADJUSTMENT,
        sku: skuId,
        lot: lotId,
        quantity,
        reason,
        performedBy: userId,
      }], { session });

      await session.commitTransaction();
      return inventory;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reserveStock(skuId: string, quantity: number, userId?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const inventory = await this.model.findOne({ sku: skuId }).session(session);
      if (!inventory || inventory.totalAvailableStock < quantity) {
        throw new Error('Insufficient stock available');
      }

      // Update inventory
      inventory.totalAvailableStock -= quantity;
      inventory.totalReservedStock += quantity;
      await inventory.save({ session });

      // Allocate from lots (FIFO)
      const lots = await LotModel.find({ 
        sku: skuId, 
        currentQuantity: { $gt: 0 },
        isDeleted: false 
      })
        .sort({ manufacturingDate: 1 })
        .session(session);

      let remainingToReserve = quantity;
      for (const lot of lots) {
        if (remainingToReserve <= 0) break;

        const toReserve = Math.min(lot.currentQuantity, remainingToReserve);
        lot.currentQuantity -= toReserve;
        lot.reservedQuantity += toReserve;
        await lot.save({ session });

        remainingToReserve -= toReserve;
      }

      await session.commitTransaction();
      return inventory;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async releaseStock(skuId: string, quantity: number) {
    return this.model.findOneAndUpdate(
      { sku: skuId },
      { 
        $inc: { 
          totalAvailableStock: quantity,
          totalReservedStock: -quantity 
        } 
      },
      { new: true }
    );
  }

  async getLowStockItems() {
    return this.model.find({
      $expr: { $lte: ['$totalAvailableStock', '$lowStockThreshold'] },
      isDeleted: false,
    })
      .populate('sku')
      .exec();
  }

  async updateStockThreshold(skuId: string, threshold: number) {
    return this.model.findOneAndUpdate(
      { sku: skuId },
      { lowStockThreshold: threshold },
      { upsert: true, new: true }
    );
  }

  async getStockValue() {
    const inventories = await this.model.find({ isDeleted: false })
      .populate('sku')
      .exec();

    let totalValue = 0;
    for (const inventory of inventories) {
      const sku = inventory.sku as any;
      if (sku) {
        totalValue += inventory.totalAvailableStock * (sku.costPrice || sku.sellingPrice || 0);
      }
    }

    return {
      totalValue: Number(totalValue.toFixed(2)),
      itemCount: inventories.length,
    };
  }
}

export const inventoryService = new InventoryService();
