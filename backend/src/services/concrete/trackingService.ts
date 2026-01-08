import { TrackingEventModel, ShipmentModel } from '../../db/mongodb';
import { logisticsService } from './logisticsService';
import { ITrackingService } from '../contracts/trackingServiceInterface';
import { IShipmentDocument as IShipment } from '../../interfaces/shipment';

export class TrackingService implements ITrackingService {
  async getTrackingByAWB(awb: string): Promise<any> {
    const events = await TrackingEventModel.find({ awb }).sort({ timestamp: -1 });
    const shipment = await ShipmentModel.findOne({ awb });

    return {
      awb,
      shipmentStatus: shipment?.status || 'UNKNOWN',
      events: events.map((event) => ({
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        message: event.message,
      })),
    };
  }

  async getLatestStatus(awb: string): Promise<string> {
    const latestEvent = await TrackingEventModel.findOne({ awb }).sort({ timestamp: -1 });
    return latestEvent?.status || 'PENDING';
  }

  async addTrackingEvent(data: {
    awb: string;
    status: string;
    location?: string;
    message?: string;
    timestamp?: Date;
  }): Promise<any> {
    return TrackingEventModel.create(data);
  }

  async updateTrackingStatus(awb: string, status: string, location?: string): Promise<any> {
    return TrackingEventModel.create({
      awb,
      status,
      location,
      timestamp: new Date(),
      message: `Status updated to ${status}${location ? ` at ${location}` : ''}`,
    });
  }
}

export const trackingService = new TrackingService();
