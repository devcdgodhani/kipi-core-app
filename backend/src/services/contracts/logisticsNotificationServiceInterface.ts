export interface ILogisticsNotificationService {
  notifyOrderConfirmed(order: any): Promise<void>;
  notifyOrderShipped(order: any, shipment: any): Promise<void>;
  notifyOutForDelivery(order: any, shipment: any): Promise<void>;
  notifyOrderDelivered(order: any, shipment: any): Promise<void>;
  notifyNdrIncident(order: any, ndr: any): Promise<void>;
  notifyRtoInitiated(order: any, shipment: any): Promise<void>;
  notifyReturnApproved(order: any, returnRequest: any): Promise<void>;
  notifyRefundProcessed(order: any, returnRequest: any): Promise<void>;
}
