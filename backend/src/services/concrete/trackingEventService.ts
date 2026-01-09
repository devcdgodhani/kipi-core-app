import { TrackingEventModel } from '../../db/mongodb/models/trackingEventModel';
import { ITrackingEventAttributes, ITrackingEventDocument } from '../../interfaces/trackingEvent';
import { MongooseCommonService } from './mongooseCommonService';
 
export class TrackingEventService extends MongooseCommonService<ITrackingEventAttributes, ITrackingEventDocument> {
  constructor() {
    super(TrackingEventModel as any);
  }
}
 
export const trackingEventService = new TrackingEventService();
