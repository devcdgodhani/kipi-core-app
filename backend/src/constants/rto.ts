export enum RTO_RISK_LEVEL {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RTO_STATUS {
  INITIATED = 'INITIATED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  ACKNOWLEDGED = 'ACKNOWLEDGED'
}

export const RTO_MESSAGES = {
  SUCCESS: {
    SCORE_CALCULATED: 'RTO Score calculated successfully'
  }
};
