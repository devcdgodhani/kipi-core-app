import { MongooseCommonService } from './mongooseCommonService';
import { ShipmentModel } from '../../db/mongodb';
import { IShipmentAttributes, IShipmentDocument } from '../../interfaces/shipment';
import { IShipmentService } from '../contracts/shipmentServiceInterface';

export class ShipmentService 
  extends MongooseCommonService<IShipmentAttributes, IShipmentDocument>
  implements IShipmentService 
{
  constructor() {
    super(ShipmentModel as any);
  }

  async findByAWB(awb: string): Promise<IShipmentDocument | null> {
    return ShipmentModel.findOne({ awb }).lean() as unknown as IShipmentDocument | null;
  }

  async updateStatus(shipmentId: string, status: string, data?: any): Promise<IShipmentDocument | null> {
    const updateData: any = {
      status,
      lastTrackedAt: new Date()
    };

    if (data) {
      Object.assign(updateData, data);
    }

    return ShipmentModel.findByIdAndUpdate(shipmentId, updateData, { new: true }).lean() as unknown as IShipmentDocument | null;
  }
}
