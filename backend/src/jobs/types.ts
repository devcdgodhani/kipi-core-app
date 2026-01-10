/**
 * Job Payload Interfaces
 * Define the structure of data passed to each job type
 */

// ============================================================================
// Logistics Job Payloads
// ============================================================================

/**
 * Payload for processing logistics webhooks (Shiprocket, etc.)
 */
export interface IWebhookJobPayload {
  provider: 'SHIPROCKET';
  headers: Record<string, any>;
  body: any;
  receivedAt: string;
}

/**
 * Payload for syncing shipment tracking updates
 */
export interface ITrackingSyncJobPayload {
  shipmentId: string;
  awb: string;
  courierId: string;
}

// ============================================================================
// Payment Job Payloads
// ============================================================================

/**
 * Payload for processing payment gateway webhooks
 */
export interface IPaymentWebhookJobPayload {
  provider: 'RAZORPAY' | 'PHONEPE' | 'PAYTM';
  headers: Record<string, any>;
  body: any;
  receivedAt: string;
}

// ============================================================================
// Notification Job Payloads
// ============================================================================

/**
 * Payload for sending email notifications
 */
export interface IEmailJobPayload {
  recipient: string | string[];
  subject: string;
  body: string;
  html?: string;
  template?: string;
  data?: Record<string, any>;
}

/**
 * Payload for sending WhatsApp messages
 */
export interface IWhatsAppJobPayload {
  accountId: string;
  contactId: string;
  message: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

/**
 * Generic notification payload (supports both email and WhatsApp)
 * @deprecated Use IEmailJobPayload or IWhatsAppJobPayload directly
 */
export interface INotificationJobPayload {
  type: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  template: string;
  data: Record<string, any>;
}
