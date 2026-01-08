export const SHIPMENT_STATUS = {
  CREATED: 'CREATED',
  SCHEDULED: 'SCHEDULED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RTO_INITIATED: 'RTO_INITIATED',
  RTO_DELIVERED: 'RTO_DELIVERED',
  NDR: 'NDR',
  LOST: 'LOST',
  DAMAGED: 'DAMAGED'
} as const;

export type SHIPMENT_STATUS = typeof SHIPMENT_STATUS[keyof typeof SHIPMENT_STATUS];

export interface IShipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  shipmentNumber: string;
  awb: string;
  courierId?: string;
  courierName: string;
  carrierId?: string;
  status: SHIPMENT_STATUS;
  trackingUrl?: string;
  labelUrl?: string; // mapped from shippingLabelUrl
  manifestUrl?: string;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  currentLocation?: string;
  timeline: {
    status: string;
    timestamp: string;
    location?: string;
    message?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IShipmentFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  courier?: string;
}
