import { IShipmentAttributes, IShipmentDocument } from '../../interfaces/shipment';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IShipmentService extends IMongooseCommonService<IShipmentAttributes, IShipmentDocument> {
  findByAWB(awb: string): Promise<IShipmentDocument | null>;
  updateStatus(shipmentId: string, status: string, data?: any): Promise<IShipmentDocument | null>;
}

