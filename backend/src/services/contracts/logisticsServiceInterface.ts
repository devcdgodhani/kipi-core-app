export interface ILogisticsService {
  checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    cod: boolean;
    providerId?: string;
  }): Promise<any>;

  createShipment(orderId: string, courierId?: number): Promise<any>;

  trackShipment(awb: string): Promise<any>;

  cancelShipment(shipmentId: string): Promise<boolean>;
}
