export const RTO_RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type TRtoRiskLevel = typeof RTO_RISK_LEVEL[keyof typeof RTO_RISK_LEVEL];

export type TRtoAction = 'ALLOW' | 'FLAG' | 'BLOCK_COD';

export interface IRtoScore {
  _id: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  riskScore: number;
  riskLevel: TRtoRiskLevel;
  factors: {
    customerHistory: number;
    pincodeRisk: number;
    orderValueRisk: number;
    accountAgeRisk: number;
  };
  suggestedAction: TRtoAction;
  createdAt: string;
}

export interface IRtoStats {
  totalRtoConfigured: number;
  highRiskOrders: number;
  rtoRate: number;
  criticalRisks: number;
}
