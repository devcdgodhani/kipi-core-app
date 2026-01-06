export interface ITrackingService {
  getTrackingByAWB(awb: string): Promise<any>;
  updateTrackingStatus(awb: string, status: string, location?: string): Promise<any>;
}
