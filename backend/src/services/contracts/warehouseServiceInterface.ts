import { IWarehouseAttributes, IWarehouseDocument } from '../../interfaces/warehouse';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IWarehouseService extends IMongooseCommonService<IWarehouseAttributes, IWarehouseDocument> {
  findPrimary(): Promise<IWarehouseAttributes | null>;
  createWarehouse(data: any): Promise<IWarehouseAttributes>;
  updateWarehouse(id: string, data: any): Promise<IWarehouseAttributes | null>;
}
