import LotModel from '../../db/mongodb/models/lotModel';
import InventoryModel from '../../db/mongodb/models/inventoryModel';
import StockMovementModel from '../../db/mongodb/models/stockMovementModel';
import { ILot, ILotAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import { STOCK_MOVEMENT_TYPE } from '../../constants';
import mongoose from 'mongoose';

export class LotService extends MongooseCommonService<ILotAttributes, ILot> {
  constructor() {
    super(LotModel);
  }

  async create(attributes: ILotAttributes | any): Promise<ILotAttributes> {
    // Ensure currentQuantity is set to initialQuantity if not provided
    if (attributes.currentQuantity === undefined || attributes.currentQuantity === null || attributes.currentQuantity === '') {
      attributes.currentQuantity = Number(attributes.initialQuantity);
    }
    
    // Ensure both are numbers
    attributes.initialQuantity = Number(attributes.initialQuantity);
    attributes.currentQuantity = Number(attributes.currentQuantity);

    const lot = (await super.create(attributes)) as any;
    return lot;
  }


  async allocateFromLot(lotId: string, quantity: number, userId?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lot = await this.model.findById(lotId).session(session);
      if (!lot) {
        throw new Error('Lot not found');
      }

      if (lot.currentQuantity < quantity) {
        throw new Error('Insufficient quantity in lot');
      }

      // Update lot quantities
      lot.currentQuantity -= quantity;
      lot.reservedQuantity += quantity;
      await lot.save({ session });

      // Record stock movement (No SKU associated)
      await StockMovementModel.create([{
        movementType: STOCK_MOVEMENT_TYPE.SALE,
        lot: lot._id,
        quantity: -quantity,
        reason: 'Allocated from lot',
        performedBy: userId,
      }], { session });

      await session.commitTransaction();
      return lot;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async adjustLotStock(lotId: string, quantity: number, reason: string, userId?: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lot = await this.model.findById(lotId).session(session);
      if (!lot) {
        throw new Error('Lot not found');
      }

      const oldQuantity = lot.currentQuantity;
      lot.currentQuantity += quantity;

      if (lot.currentQuantity < 0) {
        throw new Error('Resulting quantity cannot be negative');
      }

      await lot.save({ session });

      // Record stock movement
      await StockMovementModel.create([{
        movementType: STOCK_MOVEMENT_TYPE.ADJUSTMENT,
        lot: lot._id,
        quantity,
        reason,
        performedBy: userId,
      }], { session });

      await session.commitTransaction();
      return lot;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getExpiringLots(days: number = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.model.find({
      expiryDate: { $lte: expiryDate, $gte: new Date() },
      currentQuantity: { $gt: 0 },
      isDeleted: false,
    })
      .populate('supplierId', 'firstName lastName email mobile')
      .sort({ expiryDate: 1 })
      .exec();
  }

  async getLotHistory(lotId: string) {
    return StockMovementModel.find({ lot: lotId, isDeleted: false })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const lotService = new LotService();
