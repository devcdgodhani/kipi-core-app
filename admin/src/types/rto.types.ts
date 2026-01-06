export enum RTO_RISK_LEVEL {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RTO_ACTION {
  ALLOW = 'ALLOW',
  FLAG = 'FLAG',
  BLOCK = 'BLOCK',
  VERIFY_COD = 'VERIFY_COD'
}

export interface IRtoScore {
  riskLevel: RTO_RISK_LEVEL;
  riskScore: number;
  openRtoCount: number;
  completedRtoCount: number;
  totalOrders: number;
  rtoPercentage: number;
  reasons: string[];
  recommendedAction: RTO_ACTION;
  lastUpdated: string;
}

export interface IRtoStats {
  totalRtoConfigured: number;
  highRiskOrders: number;
  rtoRate: number;
}
