export enum SHIPMENT_STATUS {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RTO_INITIATED = 'RTO_INITIATED',
  RTO_DELIVERED = 'RTO_DELIVERED',
  NDR = 'NDR',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export const SHIPMENT_MESSAGES = {
  SUCCESS: {
    CREATED: 'Shipment created successfully',
    CANCELLED: 'Shipment cancelled successfully',
    TRACKING_FETCHED: 'Tracking info fetched successfully'
  },
  ERROR: {
    NOT_FOUND: 'Shipment not found',
    ALREADY_CANCELLED: 'Shipment is already cancelled',
    CANCELLATION_FAILED: 'Failed to cancel shipment',
    CREATION_FAILED: 'Failed to create shipment'
  }
};
