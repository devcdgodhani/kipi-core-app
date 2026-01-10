import { logisticsQueue } from '../../jobs/logistics/queue';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { ShiprocketProvider } from '../providers/shiprocketProvider';
import { ICourierProvider } from '../../interfaces/courierProvider';
import { SHIPMENT_STATUS } from '../../constants/shipment';
import { codLedgerService } from './codLedgerService';
import { orderService } from './orderService';
import { shipmentService } from './shipmentService';
import { courierService } from './courierService';

import { ILogisticsService } from '../contracts/logisticsServiceInterface';

export class LogisticsService implements ILogisticsService {
  private providers: Map<string, ICourierProvider>;
  private defaultProvider: string = 'SHIPROCKET';
  private get orderService() { return orderService; }
  private get shipmentService() { return shipmentService; }
  private get courierService() { return courierService; }

  constructor() {
    this.providers = new Map();
    this.registerProviders();
  }

  private registerProviders() {
    const shiprocket = new ShiprocketProvider();
    this.providers.set('SHIPROCKET', shiprocket);
  }

  private getProvider(providerId?: string): ICourierProvider {
    const id = providerId || this.defaultProvider;
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider ${id} not found`);
    }
    return provider;
  }

  async checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    cod: boolean;
    providerId?: string;
  }): Promise<any> {
    const provider = this.getProvider(params.providerId);
    return provider.checkServiceability(params);
  }

  async createShipment(orderId: string, courierId?: number): Promise<any> {
    // 1. Get order with populated user
    const order = await this.orderService.findById(orderId, {}, { path: 'userId' });
    if (!order) {
      throw new Error('Order not found');
    }

    // 2. Get provider
    const provider = this.getProvider();

    // 3. Prepare Shiprocket order payload
    const shiprocketOrderPayload = {
      order_id: order.orderNumber,
      order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      pickup_location: 'Primary',
      channel_id: 'custom',
      billing_customer_name: order.billingAddress.name.split(' ')[0] || 'Customer',
      billing_last_name: order.billingAddress.name.split(' ').slice(1).join(' ') || '',
      billing_address: order.billingAddress.street,
      billing_city: order.billingAddress.city,
      billing_pincode: order.billingAddress.pincode,
      billing_state: order.billingAddress.state,
      billing_country: order.billingAddress.country,
      billing_email: (order as any).userId?.email || 'customer@example.com',
      billing_phone: order.billingAddress.mobile,
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.skuCode || item.productId.toString(),
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.subTotal,
      weight: 0.5, // Default weight, should be calculated
      length: 10,
      breadth: 10,
      height: 10
    };

    // 4. Create order in Shiprocket
    const shiprocketOrder = await provider.createOrder(shiprocketOrderPayload);

    // 5. Generate AWB
    const shipmentData = await provider.createShipment({
      shipmentId: shiprocketOrder.shipmentId,
      courierId: courierId || 1
    });

    // 6. Get courier details
    const courier = await this.courierService.findOne({ code: 'SHIPROCKET' } as any);

    // 7. Save shipment to database
    const shipment = await this.shipmentService.create({
      orderId: (order as any)._id,
      orderNumber: (order as any).orderNumber,
      shipmentNumber: `SHP-${Date.now()}`,
      awb: (shipmentData as any).awb,
      courierId: (courier as any)?._id || null,
      courierName: (shipmentData as any).courierName,
      courierCode: 'SHIPROCKET',
      serviceType: 'SURFACE',
      weight: 0.5,
      dimensions: { length: 10, width: 10, height: 10 },
      pickupAddress: (order as any).shippingAddress,
      deliveryAddress: (order as any).shippingAddress,
      paymentMode: (order as any).paymentMethod === 'COD' ? 'COD' : 'PREPAID',
      codAmount: (order as any).paymentMethod === 'COD' ? (order as any).totalAmount : 0,
      declaredValue: (order as any).totalAmount,
      shippingCost: (order as any).shippingCost,
      status: SHIPMENT_STATUS.CREATED,
      providerShipmentId: shiprocketOrder.shipmentId.toString(),
      providerOrderId: shiprocketOrder.orderId.toString()
    } as any);

    // 8. Update order with shipment details
    await this.orderService.updateOne(
      { _id: (order as any)._id },
      {
        shipmentId: (shipment as any)._id,
        awb: (shipmentData as any).awb,
        trackingId: (shipmentData as any).awb
      }
    );
    
    // 9. Handle COD Ledger entry
    if (order.paymentMethod === 'COD') {
      await codLedgerService.createEntry({
        orderId: ((order as any)._id as any).toString(),
        shipmentId: ((shipment as any)._id as any).toString(),
        awb: (shipmentData as any).awb,
        codAmount: (order as any).totalAmount,
        courierId: (courier as any)?._id.toString() || '',
        courierName: (shipmentData as any).courierName
      });
    }

    return shipment;
  }

  async trackShipment(awb: string): Promise<any> {
    const provider = this.getProvider();
    return provider.trackShipment(awb);
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    const shipment = await this.shipmentService.findById(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const provider = this.getProvider();
    const providerShipmentId = parseInt((shipment as any).providerShipmentId || '0');

    await provider.cancelShipment([providerShipmentId]);

    await this.shipmentService.updateOne(
      { _id: shipmentId },
      { status: SHIPMENT_STATUS.CANCELLED }
    );

    return true;
  }

  /**
   * Background Job: Sync Tracking Status
   * Fetches latest tracking info from provider and updates local DB
   */
  async syncTrackingStatus(shipmentId: string): Promise<void> {
    const shipment = await this.shipmentService.findById(shipmentId);
    if (!shipment || !(shipment as any).awb) {
       console.warn(`Shipment ${shipmentId} not found or missing AWB`);
       return;
    }

    const awb = (shipment as any).awb;
    try {
        const trackingData = await this.trackShipment(awb);
        
        // If we get valid status, update the shipment
        if (trackingData && trackingData.tracking_data && trackingData.tracking_data.shipment_track_activities) {
             // const latestActivity = trackingData.tracking_data.shipment_track_activities[0];
             
             await this.shipmentService.updateOne(
                 { _id: shipmentId },
                 { 
                     lastTrackedAt: new Date(),
                 }
             );
        }
    } catch (error) {
        console.error(`Failed to sync tracking for shipment ${shipmentId}:`, error);
        throw error;
    }
  }
}

export const logisticsService = new LogisticsService();
