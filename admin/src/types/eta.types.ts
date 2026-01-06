export interface IEtaOption {
  courierId: string;
  courierName: string;
  estimatedDays: number;
  estimatedDate: string;
  cost: number;
  confidenceScore: number; // 0-100
  isFastest: boolean;
  isCheapest: boolean;
  ratings?: number;
}
