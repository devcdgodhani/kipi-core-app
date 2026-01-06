export interface ICourier {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  priority: number;
  type: 'AGGREGATOR' | 'DIRECT';
  serviceableRegions: string[]; // State codes or 'ALL'
  rating?: number;
  apiConfig?: any;
}

export interface ICourierFilters {
  status?: 'active' | 'inactive';
  search?: string;
}
