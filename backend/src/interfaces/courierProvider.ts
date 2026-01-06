// Courier Provider Interface - Abstraction for all courier providers

export interface ICourierProvider {
  readonly providerName: string;
  readonly providerCode: string;

  // Authentication
  authenticate(): Promise<boolean>;

  // Serviceability
  checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    cod: boolean;
  }): Promise<{
    isServiceable: boolean;
    couriers: Array<{
      courierId: number;
      courierName: string;
      estimatedDays: number;
      rate: number;
      codCharges?: number;
    }>;
  }>;

  // Order & Shipment Creation
  createOrder(params: any): Promise<{
    orderId: number;
    shipmentId: number;
    status: string;
  }>;

  createShipment(params: {
    shipmentId: number;
    courierId: number;
  }): Promise<{
    awb: string;
    courierId: number;
    courierName: string;
    pickupScheduledDate?: string;
    estimatedDelivery?: string;
    labelUrl?: string;
  }>;

  // Label Generation
  generateLabel(shipmentId: string): Promise<{
    labelUrl: string;
    manifestUrl?: string;
  }>;

  // Tracking
  trackShipment(awb: string): Promise<{
    trackingData: any;
    activities: any[];
  }>;

  // Cancellation
  cancelShipment(shipmentIds: number[]): Promise<boolean>;

  // Webhook Handling
  validateWebhook(payload: any, signature: string): boolean;
  normalizeWebhook(payload: any): {
    eventId: string;
    eventType: string;
    shipmentId: string;
    awb: string;
    status: string;
    statusCode?: string;
    timestamp: Date;
    location?: string;
    message: string;
    provider: string;
    rawPayload: any;
  };
}
