import { WarehouseModel } from '../../db/mongodb';
import { IWarehouseAttributes, IWarehouseDocument } from '../../interfaces/warehouse';
import { IWarehouseService } from '../contracts/warehouseServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class WarehouseService 
  extends MongooseCommonService<IWarehouseAttributes, IWarehouseDocument> 
  implements IWarehouseService 
{
  constructor() {
    super(WarehouseModel);
  }

  async findPrimary(): Promise<IWarehouseAttributes | null> {
    return await this.findOne({ isPrimary: true, isActive: true });
  }

  /**
   * Overriding create to ensure only one primary warehouse exists
   */
  async createWarehouse(data: any): Promise<IWarehouseAttributes> {
    if (data.isPrimary) {
      // Unmark other primary warehouses
      await WarehouseModel.updateMany({ isPrimary: true }, { isPrimary: false });
    }
    return await this.create(data);
  }

  async updateWarehouse(id: string, data: any): Promise<IWarehouseAttributes | null> {
    if (data.isPrimary) {
      // Unmark other primary warehouses
      await WarehouseModel.updateMany({ isPrimary: true, _id: { $ne: id } }, { isPrimary: false });
    }
    return await WarehouseModel.findByIdAndUpdate(id, data, { new: true }).lean() as any;
  }
}
