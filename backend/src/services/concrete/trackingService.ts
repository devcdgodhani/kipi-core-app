import { ITrackingService } from '../contracts/trackingServiceInterface';
import { ShipmentService } from './shipmentService';
import { TrackingEventService } from './trackingEventService';

export class TrackingService implements ITrackingService {
  private shipmentService = new ShipmentService();
  private trackingEventService = new TrackingEventService();
  async getTrackingByAWB(awb: string): Promise<any> {
    const events = await this.trackingEventService.findAll({ awb } as any, { sort: { timestamp: -1 } });
    const shipment = await this.shipmentService.findOne({ awb } as any);

    return {
      awb,
      shipmentStatus: shipment?.status || 'UNKNOWN',
      events: events.map((event: any) => ({
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        message: event.message,
      })),
    };
  }

  async getLatestStatus(awb: string): Promise<string> {
    const latestEvent = await this.trackingEventService.findOne({ awb } as any, { sort: { timestamp: -1 } });
    return latestEvent?.status || 'PENDING';
  }

  async addTrackingEvent(data: {
    awb: string;
    status: string;
    location?: string;
    message?: string;
    timestamp?: Date;
  }): Promise<any> {
    return this.trackingEventService.create(data as any);
  }

  async updateTrackingStatus(awb: string, status: string, location?: string): Promise<any> {
    return this.trackingEventService.create({
      awb,
      status,
      location,
      timestamp: new Date(),
      message: `Status updated to ${status}${location ? ` at ${location}` : ''}`,
    } as any);
  }
}

export const trackingService = new TrackingService();
