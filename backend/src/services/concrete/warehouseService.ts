import { WarehouseModel, IWarehouse } from '../../db/mongodb';
import { IWarehouseService } from '../contracts/warehouseServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class WarehouseService 
  extends MongooseCommonService<any, IWarehouse> 
  implements IWarehouseService 
{
  constructor() {
    super(WarehouseModel);
  }

  async findPrimary(): Promise<IWarehouse | null> {
    return await this.findOne({ isPrimary: true, isActive: true });
  }

  /**
   * Overriding create to ensure only one primary warehouse exists
   */
  async createWarehouse(data: any): Promise<IWarehouse> {
    if (data.isPrimary) {
      // Unmark other primary warehouses
      await WarehouseModel.updateMany({ isPrimary: true }, { isPrimary: false });
    }
    return await this.create(data);
  }

  async updateWarehouse(id: string, data: any): Promise<IWarehouse | null> {
    if (data.isPrimary) {
      // Unmark other primary warehouses
      await WarehouseModel.updateMany({ isPrimary: true, _id: { $ne: id } }, { isPrimary: false });
    }
    return await WarehouseModel.findByIdAndUpdate(id, data, { new: true }).lean() as unknown as IWarehouse;
  }
}
