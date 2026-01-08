import { WebhookLogModel, ShipmentModel, TrackingEventModel, OrderModel, UserModel, NDRModel } from '../../db/mongodb';
import { ShiprocketProvider } from '../providers/shiprocketProvider';
import { SHIPMENT_STATUS } from '../../constants/shipment';
import { logisticsNotificationService } from './logisticsNotificationService';
import { IWebhookJobPayload } from '../../jobs/types';
import { inventoryService } from './inventoryService';
import { codLedgerService } from './codLedgerService';
import { loyaltyService } from './loyaltyService';
import { couponService } from './couponService';
import { LOYALTY_TRANSACTION_TYPE } from '../../constants/loyalty';

import { IWebhookService } from '../contracts/webhookServiceInterface';

export class WebhookService implements IWebhookService {
  private shiprocketProvider: ShiprocketProvider;

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
    const logEntry = await WebhookLogModel.create({
      eventId: normalizedEvent.eventId,
      provider: provider,
      eventType: normalizedEvent.eventType,
      payload: payload,
      headers: headers,
      status: 'PENDING'
    });

    return { isValid: true, logId: logEntry._id.toString(), normalizedEvent };
  }

  /**
   * Processes the normalized event. This should be called by the Worker.
   */
  async processEvent(event: any) {
    const { shipmentId, awb, status, eventType, timestamp, location, message, eventId } = event;

    try {
      // 1. Update Shipment Status
      const shipment = await ShipmentModel.findOne({ awb });
      if (shipment) {
        shipment.status = this.mapToShipmentStatus(eventType);
        shipment.currentLocation = location;
        shipment.lastTrackedAt = new Date();
        
        if (eventType === 'DELIVERED') {
          if (shipment.status !== SHIPMENT_STATUS.DELIVERED) {
            const order = await OrderModel.findById(shipment.orderId);
            if (order) {
              await UserModel.findByIdAndUpdate(order.userId, { $inc: { 'metrics.deliveredCount': 1 } });
              // Update COD Ledger
              if (order.paymentMethod === 'COD') {
                await codLedgerService.updateStatus(awb, 'DELIVERED');
              }
              // Update Order Status
              await OrderModel.updateOne({ _id: order._id }, { $set: { orderStatus: 'DELIVERED' } });
              // Notify Delivery
              await logisticsNotificationService.notifyOrderDelivered(order, shipment);
            }
          }
          shipment.actualDeliveryDate = new Date(timestamp);
        } else if (eventType === 'PICKED_UP') {
          shipment.pickupCompletedDate = new Date(timestamp);
          await OrderModel.updateOne({ _id: shipment.orderId }, { $set: { orderStatus: 'SHIPPED' } });
        } else if (eventType === 'OUT_FOR_DELIVERY') {
          // Notify OFD
          const order = await OrderModel.findById(shipment.orderId);
          if (order) await logisticsNotificationService.notifyOutForDelivery(order, shipment);
        } else if (eventType === 'RTO') {
          if (!shipment.isRTO) {
            shipment.isRTO = true;
            const order = await OrderModel.findById(shipment.orderId);
            if (order) {
              await UserModel.findByIdAndUpdate(order.userId, { $inc: { 'metrics.rtoCount': 1 } });
              
              // 1. Loyalty Point Reversal for RTO
              if (order.pointsUsed && order.pointsUsed > 0) {
                await loyaltyService.updateBalance(
                  order.userId.toString(),
                  order.pointsUsed,
                  LOYALTY_TRANSACTION_TYPE.REFUNDED,
                  `Refunded from RTO Order #${order.orderNumber}`,
                  order._id.toString()
                );
              }

              // 2. Coupon Reversal for RTO
              if (order.couponCode) {
                await couponService.revertUsage(order.couponCode);
              }

              // 3. Inventory Restocking for RTO
              for (const item of order.items) {
                await inventoryService.restock({
                  skuId: item.skuId?.toString(),
                  productId: item.productId?.toString(),
                  quantity: item.quantity,
                  referenceId: order._id.toString(),
                  referenceType: 'RTO',
                  reason: `RTO restock for Order #${order.orderNumber}`
                });
              }

              // 3. Update COD Ledger
              if (order.paymentMethod === 'COD') {
                await codLedgerService.updateStatus(awb, 'RTO');
              }

              // 4. Update Order Status
              await OrderModel.updateOne({ _id: order._id }, { $set: { orderStatus: 'RETURNED' } });

              // 5. Notify RTO
              await logisticsNotificationService.notifyRtoInitiated(order, shipment);
            }
          }
          if (!shipment.rtoInitiatedDate) {
            shipment.rtoInitiatedDate = new Date(timestamp);
            shipment.rtoReason = message;
          }
        } else if (eventType === 'NDR') {
          // 1. Create NDR Record
          const order = await OrderModel.findById(shipment.orderId);
          if (order) {
            await NDRModel.create({
              shipmentId: shipment._id,
              orderId: order._id,
              awb: shipment.awb,
              ndrDate: timestamp ? new Date(timestamp) : new Date(),
              ndrReason: status || 'UNDELIVERED',
              ndrReasonText: message || 'Delivery failed',
              attemptNumber: 1, // This should be calculated or passed by provider
              status: 'PENDING'
            });
            // 2. Notify NDR
            await logisticsNotificationService.notifyNdrIncident(order, { ndrReasonText: message });
          }
        }

        await shipment.save();
      }

      // 2. Create Tracking Event
      if (shipment) {
        await TrackingEventModel.create({
          shipmentId: shipment._id,
          awb,
          eventType,
          status,
          location,
          timestamp: new Date(timestamp),
          message: message || status,
          providerData: event.rawPayload
        });
      }

      // 3. Update Log Status to PROCESSED
      await WebhookLogModel.updateOne(
        { eventId: eventId },
        { status: 'PROCESSED', processedAt: new Date() }
      );

      return true;
    } catch (error) {
      console.error('Event processing failed:', error);
      // Update Log Status to FAILED
      await WebhookLogModel.updateOne(
        { eventId: eventId },
        { 
          status: 'FAILED', 
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date() 
        }
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
