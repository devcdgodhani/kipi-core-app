import StockMovementModel from '../../db/mongodb/models/stockMovementModel';
import { IStockMovement, IStockMovementAttributes } from '../../interfaces';
import { MongooseCommonService } from './mongooseCommonService';
import { STOCK_MOVEMENT_TYPE } from '../../constants';

export class StockMovementService extends MongooseCommonService<IStockMovementAttributes, IStockMovement> {
  constructor() {
    super(StockMovementModel);
  }

  async recordMovement(data: IStockMovementAttributes) {
    return this.create(data);
  }

  async getMovementHistory(skuId: string, filters?: {
    movementType?: STOCK_MOVEMENT_TYPE;
    startDate?: Date;
    endDate?: Date;
    lotId?: string;
  }) {
    const query: any = { sku: skuId, isDeleted: false };

    if (filters?.movementType) {
      query.movementType = filters.movementType;
    }

    if (filters?.lotId) {
      query.lot = filters.lotId;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    return this.model.find(query)
      .populate('sku')
      .populate('lot')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMovementsByType(type: STOCK_MOVEMENT_TYPE, filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const query: any = { movementType: type, isDeleted: false };

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    return this.model.find(query)
      .populate('sku')
      .populate('lot')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMovementsByLot(lotId: string) {
    return this.model.find({ lot: lotId, isDeleted: false })
      .populate('sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const stockMovementService = new StockMovementService();
