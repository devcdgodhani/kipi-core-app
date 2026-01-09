import { WarehouseModel } from '../../db/mongodb';
import { IWarehouseAttributes, IWarehouseDocument } from '../../interfaces/warehouse';
import { IWarehouseService } from '../contracts/warehouseServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class WarehouseService 
  extends MongooseCommonService<IWarehouseAttributes, IWarehouseDocument> 
  implements IWarehouseService 
{
  constructor() {
    super(WarehouseModel as any);
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
      await this.update({ isPrimary: true } as any, { isPrimary: false } as any);
    }
    return await this.create(data);
  }

  async updateWarehouse(id: string, data: any): Promise<IWarehouseAttributes | null> {
    if (data.isPrimary) {
      // Unmark other primary warehouses
      await this.update({ isPrimary: true, _id: { $ne: id } } as any, { isPrimary: false } as any);
    }
    return await this.findOneAndUpdate({ _id: id } as any, { $set: data } as any, { new: true });
  }
}
 
export const warehouseService = new WarehouseService();
