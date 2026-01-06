export interface ICourier {
  _id: string;
  name: string;
  code: string;
  provider: string;
  isActive: boolean;
  isPrimary: boolean;
  serviceTypes: Array<{
    type: string;
    name: string;
    estimatedDays: number;
    isActive: boolean;
  }>;
  pricingConfig?: any;
  codCharges?: number;
  rtoCharges?: number;
  apiUrl?: string;
  apiCredentials?: string;
  webhookSecret?: string;
  avgDeliveryDays?: number;
  rtoPercentage?: number;
  onTimeDeliveryRate?: number;
  maxWeight?: number;
  maxCODAmount?: number;
  supportEmail?: string;
  supportPhone?: string;
  slaMin?: number;
  slaMax?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICourierFilters {
  status?: string;
  search?: string;
}
