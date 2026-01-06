export enum WEBHOOK_STATUS {
  RECEIVED = 'RECEIVED',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export enum REFUND_TYPE {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  RTO = 'RTO',
  RETURN = 'RETURN',
  CANCELLATION = 'CANCELLATION'
}

export enum REFUND_STATUS {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum REFUND_METHOD {
  ORIGINAL_PAYMENT = 'ORIGINAL_PAYMENT',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STORE_CREDIT = 'STORE_CREDIT'
}

export enum COD_STATUS {
  PENDING = 'PENDING',
  COLLECTED = 'COLLECTED',
  SETTLED = 'SETTLED',
  REMITTED = 'REMITTED',
  FAILED = 'FAILED'
}

export const LOGISTICS_MESSAGES = {
  SUCCESS: {
    REFUND_INITIATED: 'Refund initiated successfully',
    COD_RECONCILED: 'COD reconciled successfully',
    WEBHOOK_PROCESSED: 'Webhook processed successfully'
  },
  ERROR: {
    REFUND_FAILED: 'Refund processing failed',
    INVALID_WEBHOOK: 'Invalid webhook signature',
    COD_MISMATCH: 'COD amount mismatch'
  }
};
