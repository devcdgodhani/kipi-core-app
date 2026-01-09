import { ShiprocketProvider } from '../providers/shiprocketProvider';
import { SHIPMENT_STATUS } from '../../constants/shipment';
import { logisticsNotificationService } from './logisticsNotificationService';
import { IWebhookJobPayload } from '../../jobs/types';
import { inventoryService } from './inventoryService';
import { codLedgerService } from './codLedgerService';
import { loyaltyService } from './loyaltyService';
import { couponService } from './couponService';
import { LOYALTY_TRANSACTION_TYPE } from '../../constants/loyalty';
import { webhookLogService } from './webhookLogService';
import { shipmentService } from './shipmentService';
import { trackingEventService } from './trackingEventService';
import { orderService } from './orderService';
import { userService } from './userService';
import { ndrService } from './ndrService';

import { IWebhookService } from '../contracts/webhookServiceInterface';

export class WebhookService implements IWebhookService {
  private shiprocketProvider: ShiprocketProvider;
  private get webhookLogService() { return webhookLogService; }
  private get shipmentService() { return shipmentService; }
  private get trackingEventService() { return trackingEventService; }
  private get orderService() { return orderService; }
  private get userService() { return userService; }
  private get ndrService() { return ndrService; }

  constructor() {
    this.shiprocketProvider = new ShiprocketProvider();
  }

  /**
   * Validates and logs initial webhook reception.
   * Does NOT process the business logic (DB updates).
   */
  async validateAndLog(payload: any, headers: any, provider: string): Promise<{ isValid: boolean; logId?: string; normalizedEvent?: any }> {
    // 1. Validate signature
    const signature = headers['x-shiprocket-signature'];
    const isValid = this.shiprocketProvider.validateWebhook(payload, signature);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return { isValid: false };
    }

    // 2. Normalize payload
    const normalizedEvent = this.shiprocketProvider.normalizeWebhook(payload);

    // 3. Log webhook with PENDING status
    const logEntry = await this.webhookLogService.create({
      eventId: normalizedEvent.eventId,
      provider: provider,
      eventType: normalizedEvent.eventType,
      payload: payload,
      headers: headers,
      status: 'PENDING'
    } as any);

    return { isValid: true, logId: (logEntry as any)._id.toString(), normalizedEvent };
  }

  /**
   * Processes the normalized event. This should be called by the Worker.
   */
  async processEvent(event: any) {
    const { shipmentId, awb, status, eventType, timestamp, location, message, eventId } = event;

    try {
      // 1. Update Shipment Status
      const shipment = await this.shipmentService.findOne({ awb } as any);
      if (shipment) {
        shipment.status = this.mapToShipmentStatus(eventType);
        shipment.currentLocation = location;
        shipment.lastTrackedAt = new Date();
        
        if (eventType === 'DELIVERED') {
          if ((shipment as any).status !== SHIPMENT_STATUS.DELIVERED) {
            const order = await this.orderService.findById((shipment as any).orderId);
            if (order) {
              await this.userService.updateOne({ _id: (order as any).userId } as any, { $inc: { 'metrics.deliveredCount': 1 } } as any);
              // Update COD Ledger
              if ((order as any).paymentMethod === 'COD') {
                await codLedgerService.updateStatus(awb, 'DELIVERED');
              }
              // Update Order Status
              await this.orderService.updateOne({ _id: (order as any)._id } as any, { $set: { orderStatus: 'DELIVERED' } } as any);
              // Notify Delivery
              await logisticsNotificationService.notifyOrderDelivered(order as any, shipment as any);
            }
          }
          (shipment as any).actualDeliveryDate = new Date(timestamp);
        } else if (eventType === 'PICKED_UP') {
          (shipment as any).pickupCompletedDate = new Date(timestamp);
          await this.orderService.updateOne({ _id: (shipment as any).orderId } as any, { $set: { orderStatus: 'SHIPPED' } } as any);
        } else if (eventType === 'OUT_FOR_DELIVERY') {
          // Notify OFD
          const order = await this.orderService.findById((shipment as any).orderId);
          if (order) await logisticsNotificationService.notifyOutForDelivery(order as any, shipment as any);
        } else if (eventType === 'RTO') {
          if (!(shipment as any).isRTO) {
            (shipment as any).isRTO = true;
            const order = await this.orderService.findById((shipment as any).orderId);
            if (order) {
              await this.userService.updateOne({ _id: (order as any).userId } as any, { $inc: { 'metrics.rtoCount': 1 } } as any);
              
              // 1. Loyalty Point Reversal for RTO
              if ((order as any).pointsUsed && (order as any).pointsUsed > 0) {
                await loyaltyService.updateBalance(
                  (order as any).userId.toString(),
                  (order as any).pointsUsed,
                  LOYALTY_TRANSACTION_TYPE.REFUNDED,
                  `Refunded from RTO Order #${(order as any).orderNumber}`,
                  (order as any)._id.toString()
                );
              }
 
              // 2. Coupon Reversal for RTO
              if ((order as any).couponCode) {
                await couponService.revertUsage((order as any).couponCode);
              }
 
              // 3. Inventory Restocking for RTO
              for (const item of (order as any).items) {
                await inventoryService.restock({
                  skuId: item.skuId?.toString(),
                  productId: item.productId?.toString(),
                  quantity: item.quantity,
                  referenceId: (order as any)._id.toString(),
                  referenceType: 'RTO',
                  reason: `RTO restock for Order #${(order as any).orderNumber}`
                });
              }
 
              // 3. Update COD Ledger
              if ((order as any).paymentMethod === 'COD') {
                await codLedgerService.updateStatus(awb, 'RTO');
              }
 
              // 4. Update Order Status
              await this.orderService.updateOne({ _id: (order as any)._id } as any, { $set: { orderStatus: 'RETURNED' } } as any);
 
              // 5. Notify RTO
              await logisticsNotificationService.notifyRtoInitiated(order as any, shipment as any);
            }
          }
          if (!(shipment as any).rtoInitiatedDate) {
            (shipment as any).rtoInitiatedDate = new Date(timestamp);
            (shipment as any).rtoReason = message;
          }
        } else if (eventType === 'NDR') {
          // 1. Create NDR Record
          const order = await this.orderService.findById((shipment as any).orderId);
          if (order) {
            await this.ndrService.create({
              shipmentId: (shipment as any)._id,
              orderId: (order as any)._id,
              awb: (shipment as any).awb,
              ndrDate: timestamp ? new Date(timestamp) : new Date(),
              ndrReason: status || 'UNDELIVERED',
              ndrReasonText: message || 'Delivery failed',
              attemptNumber: 1, // This should be calculated or passed by provider
              status: 'PENDING'
            } as any);
            // 2. Notify NDR
            await logisticsNotificationService.notifyNdrIncident(order as any, { ndrReasonText: message });
          }
        }
 
        await this.shipmentService.updateOne({ _id: (shipment as any)._id } as any, shipment as any);
      }

      // 2. Create Tracking Event
      if (shipment) {
        await this.trackingEventService.create({
          shipmentId: (shipment as any)._id,
          awb,
          eventType,
          status,
          location,
          timestamp: new Date(timestamp),
          message: message || status,
          providerData: event.rawPayload
        } as any);
      }

      // 3. Update Log Status to PROCESSED
      await this.webhookLogService.updateOne(
        { eventId: eventId } as any,
        { status: 'PROCESSED', processedAt: new Date() } as any
      );

      return true;
    } catch (error) {
      console.error('Event processing failed:', error);
      // Update Log Status to FAILED
      await this.webhookLogService.updateOne(
        { eventId: eventId } as any,
        { 
          status: 'FAILED', 
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date() 
        } as any
      );
      throw error; // Rethrow to let BullMQ retry
    }
  }

  // Deprecated: Kept for backward compatibility if needed, using sync flow
  async processWebhook(payload: any, headers: any, provider: string): Promise<boolean> {
    const { isValid, normalizedEvent } = await this.validateAndLog(payload, headers, provider);
    if (!isValid || !normalizedEvent) return false;
    
    try {
      await this.processEvent(normalizedEvent);
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToShipmentStatus(eventType: string): string {
    switch (eventType) {
      case 'PICKED_UP': return SHIPMENT_STATUS.PICKED_UP;
      case 'IN_TRANSIT': return SHIPMENT_STATUS.IN_TRANSIT;
      case 'OUT_FOR_DELIVERY': return SHIPMENT_STATUS.OUT_FOR_DELIVERY;
      case 'DELIVERED': return SHIPMENT_STATUS.DELIVERED;
      case 'RTO': return SHIPMENT_STATUS.RTO_INITIATED;
      case 'NDR': return SHIPMENT_STATUS.NDR;
      default: return SHIPMENT_STATUS.IN_TRANSIT;
    }
  }
}

export const webhookService = new WebhookService();
