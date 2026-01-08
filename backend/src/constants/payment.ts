/**
 * Payment Module Constants
 * Contains all enums, status codes, and static values for payment gateway system
 */

// Payment Gateway Names
export enum PAYMENT_GATEWAY {
  PHONEPE = 'phonepe',
  RAZORPAY = 'razorpay',
  PAYTM = 'paytm'
}

// Payment Gateway Display Names
export const PAYMENT_GATEWAY_DISPLAY_NAMES = {
  [PAYMENT_GATEWAY.PHONEPE]: 'PhonePe',
  [PAYMENT_GATEWAY.RAZORPAY]: 'Razorpay',
  [PAYMENT_GATEWAY.PAYTM]: 'Paytm'
} as const;

// Gateway Environment
export enum GATEWAY_ENVIRONMENT {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production'
}

// Payment Status
export enum PAYMENT_STATUS {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND'
}

// Refund Status
export enum REFUND_STATUS {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

// Refund Reasons
export enum REFUND_REASON {
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
  RETURN = 'RETURN',
  RTO = 'RTO',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  CANCELLATION = 'CANCELLATION',
  OTHER = 'OTHER'
}

// Default Configuration Values
export const PAYMENT_GATEWAY_DEFAULTS = {
  TIMEOUT: 300, // 5 minutes in seconds
  RETRY_ATTEMPTS: 3,
  CURRENCY: 'INR',
  PRIORITY: {
    PHONEPE: 1,
    RAZORPAY: 2,
    PAYTM: 3
  }
} as const;

// API URLs
export const PAYMENT_GATEWAY_URLS = {
  PHONEPE: {
    SANDBOX: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
    PRODUCTION: 'https://api.phonepe.com/apis/hermes'
  },
  RAZORPAY: {
    // Razorpay uses SDK, no direct URL needed
    SANDBOX: 'https://api.razorpay.com/v1',
    PRODUCTION: 'https://api.razorpay.com/v1'
  },
  PAYTM: {
    SANDBOX: 'https://securegw-stage.paytm.in',
    PRODUCTION: 'https://securegw.paytm.in'
  }
} as const;

// Success Messages
export const PAYMENT_SUCCESS_MESSAGES = {
  GATEWAY_FETCHED: 'Payment gateways fetched successfully',
  GATEWAY_UPDATED: 'Payment gateway updated successfully',
  GATEWAY_TOGGLED: 'Payment gateway toggled successfully',
  PAYMENT_INITIATED: 'Payment initiated successfully',
  PAYMENT_VERIFIED: 'Payment verified successfully',
  PAYMENT_FETCHED: 'Payment details fetched successfully',
  PAYMENTS_FETCHED: 'Payments fetched successfully',
  REFUND_INITIATED: 'Refund initiated successfully',
  REFUND_SYNCED: 'Refund status synced successfully',
  REFUNDS_FETCHED: 'Refunds fetched successfully'
} as const;

// Error Messages
export const PAYMENT_ERROR_MESSAGES = {
  GATEWAY_NOT_FOUND: 'Payment gateway not found',
  GATEWAY_DISABLED: 'Payment gateway is disabled',
  PAYMENT_NOT_FOUND: 'Payment not found',
  PAYMENT_ALREADY_PROCESSED: 'Payment already processed',
  INVALID_PAYMENT_STATUS: 'Invalid payment status',
  REFUND_AMOUNT_EXCEEDS: 'Refund amount exceeds payment amount',
  REFUND_NOT_FOUND: 'Refund not found',
  WEBHOOK_SIGNATURE_INVALID: 'Invalid webhook signature',
  GATEWAY_ERROR: 'Payment gateway error',
  ENCRYPTION_KEY_MISSING: 'Encryption key not configured'
} as const;

// Payment Method Types (from gateway responses)
export enum PAYMENT_METHOD {
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
  EMI = 'EMI',
  UNKNOWN = 'UNKNOWN'
}

// Webhook Event Types
export enum WEBHOOK_EVENT_TYPE {
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_PENDING = 'payment.pending',
  REFUND_SUCCESS = 'refund.success',
  REFUND_FAILED = 'refund.failed',
  REFUND_PENDING = 'refund.pending'
}
