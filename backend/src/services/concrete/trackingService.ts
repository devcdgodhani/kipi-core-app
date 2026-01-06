import { TrackingEventModel, IShipment, ShipmentModel } from '../../db/mongodb';
import { logisticsService } from './logisticsService';

import { ITrackingService } from '../contracts/trackingServiceInterface';

export class TrackingService implements ITrackingService {
  async getTrackingByAWB(awb: string) {
    // 1. Check local DB first
    const events = await TrackingEventModel.find({ awb }).sort({ timestamp: -1 }).lean();
    
    // 2. Fetch live data if no recent events (older than 1 hour)
    const latestEvent = events[0];
    const isStale = !latestEvent || (Date.now() - new Date(latestEvent.timestamp).getTime()) > 3600000;

    if (isStale) {
      try {
        const liveData = await logisticsService.trackShipment(awb);
        // We could sync live data here, but for now we just return it merged or separate
        // For simplicity in this stage, we'll return local events merged with live status
        return {
          awb,
          currentStatus: liveData.trackingData.track_status,
          events: liveData.activities.map((activity: any) => ({
            status: activity.status,
            location: activity.location,
            timestamp: activity.date,
            message: activity.activity
          }))
        };
      } catch (error) {
        console.error('Error fetching live tracking:', error);
      }
    }

    const shipment = await ShipmentModel.findOne({ awb }).select('status estimatedDeliveryDate courierName').lean();

    return {
      awb,
      currentStatus: shipment?.status,
      estimatedDelivery: shipment?.estimatedDeliveryDate,
      courier: shipment?.courierName,
      events
    };
  }

  async addTrackingEvent(data: any) {
    return TrackingEventModel.create(data);
  }

  async updateTrackingStatus(awb: string, status: string, location?: string): Promise<any> {
    return TrackingEventModel.create({
      awb,
      status,
      location,
      timestamp: new Date(),
      message: `Status updated to ${status}`
    });
  }
}

export const trackingService = new TrackingService();
