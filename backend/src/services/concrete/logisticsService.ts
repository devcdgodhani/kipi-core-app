import { logisticsQueues } from '../../jobs/queues/logisticsQueues';
import { JOB_NAMES } from '../../jobs/types';
import { ShiprocketProvider } from '../providers/shiprocketProvider';
import { ICourierProvider } from '../../interfaces/courierProvider';
import { ShipmentModel, OrderModel, CourierModel } from '../../db/mongodb';
import { SHIPMENT_STATUS } from '../../constants/shipment';

import { ILogisticsService } from '../contracts/logisticsServiceInterface';

export class LogisticsService implements ILogisticsService {
  private providers: Map<string, ICourierProvider>;
  private defaultProvider: string = 'SHIPROCKET';

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
    const order = await OrderModel.findById(orderId).populate('userId').lean() as any;
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
      billing_email: order.userId.email || 'customer@example.com',
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
    const courier = await CourierModel.findOne({ code: 'SHIPROCKET' }).lean();

    // 7. Save shipment to database
    const shipment = await ShipmentModel.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      shipmentNumber: `SHP-${Date.now()}`,
      awb: shipmentData.awb,
      courierId: courier?._id || null,
      courierName: shipmentData.courierName,
      courierCode: 'SHIPROCKET',
      serviceType: 'SURFACE',
      weight: 0.5,
      dimensions: { length: 10, width: 10, height: 10 },
      pickupAddress: order.shippingAddress,
      deliveryAddress: order.shippingAddress,
      paymentMode: order.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
      codAmount: order.paymentMethod === 'COD' ? order.totalAmount : 0,
      declaredValue: order.totalAmount,
      shippingCost: order.shippingCost,
      status: SHIPMENT_STATUS.CREATED,
      providerShipmentId: shiprocketOrder.shipmentId.toString(),
      providerOrderId: shiprocketOrder.orderId.toString()
    });

    // 8. Update order with shipment details
    await OrderModel.updateOne(
      { _id: order._id },
      {
        shipmentId: shipment._id,
        awb: shipmentData.awb,
        trackingId: shipmentData.awb
      }
    );

    return shipment;
  }

  async trackShipment(awb: string): Promise<any> {
    const provider = this.getProvider();
    return provider.trackShipment(awb);
  }

  async cancelShipment(shipmentId: string): Promise<boolean> {
    const shipment = await ShipmentModel.findById(shipmentId).lean();
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const provider = this.getProvider();
    const providerShipmentId = parseInt(shipment.providerShipmentId || '0');

    await provider.cancelShipment([providerShipmentId]);

    await ShipmentModel.updateOne(
      { _id: shipmentId },
      { status: SHIPMENT_STATUS.CANCELLED }
    );

    return true;
  }
}

export const logisticsService = new LogisticsService();
