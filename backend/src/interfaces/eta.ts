export interface IEtaAttributes {
  destinationPincode: string;
  courierId?: string;
  pickupPincode?: string;
  weight?: number;
}

export interface IEtaResult {
  courierName: string;
  courierId: string;
  estimatedDays: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedDeliveryDate: Date;
}
