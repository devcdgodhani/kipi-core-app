import { IWarehouse } from '../../db/mongodb/models/warehouseModel';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IWarehouseService extends IMongooseCommonService<any, IWarehouse> {
  findPrimary(): Promise<IWarehouse | null>;
  createWarehouse(data: any): Promise<IWarehouse>;
  updateWarehouse(id: string, data: any): Promise<IWarehouse | null>;
}
