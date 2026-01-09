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
    return this.findOne({ awb } as any) as any;
  }

  async updateStatus(shipmentId: string, status: string, data?: any): Promise<IShipmentDocument | null> {
    const updateData: any = {
      status,
      lastTrackedAt: new Date()
    };

    if (data) {
      Object.assign(updateData, data);
    }

    await this.updateOne({ _id: shipmentId } as any, { $set: updateData } as any);
    return this.findById(shipmentId) as any;
  }
}
 
export const shipmentService = new ShipmentService();
