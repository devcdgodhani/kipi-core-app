import axios, { AxiosInstance } from 'axios';
import { ICourierProvider } from '../../interfaces/courierProvider';
import { SHIPROCKET_CONFIG, SHIPROCKET_CONSTANTS } from '../../configs/shiprocket';
import crypto from 'crypto';

export class ShiprocketProvider implements ICourierProvider {
  readonly providerName = SHIPROCKET_CONSTANTS.PROVIDER_NAME;
  readonly providerCode = SHIPROCKET_CONSTANTS.PROVIDER_CODE;

  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: SHIPROCKET_CONFIG.BASE_URL,
      timeout: SHIPROCKET_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add token
    this.axiosInstance.interceptors.request.use(async (config: any) => {
      await this.ensureAuthenticated();
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          this.token = null;
          this.tokenExpiry = null;
        }
        throw this.handleError(error);
      }
    );
  }

  // Authentication
  async authenticate(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${SHIPROCKET_CONFIG.BASE_URL}/external/auth/login`,
        {
          email: SHIPROCKET_CONFIG.EMAIL,
          password: SHIPROCKET_CONFIG.PASSWORD
        }
      );

      this.token = response.data.token;
      this.tokenExpiry = new Date(
        Date.now() + SHIPROCKET_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      );

      return true;
    } catch (error) {
      console.error('Shiprocket authentication failed:', error);
      throw new Error('Shiprocket authentication failed');
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.token || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  // Serviceability Check
  async checkServiceability(params: {
    pickupPincode: string;
    deliveryPincode: string;
    weight: number;
    cod: boolean;
  }): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/external/courier/serviceability', {
        params: {
          pickup_postcode: params.pickupPincode,
          delivery_postcode: params.deliveryPincode,
          cod: params.cod ? 1 : 0,
          weight: params.weight
        }
      });

      return {
        isServiceable: response.data.data.available_courier_companies.length > 0,
        couriers: response.data.data.available_courier_companies.map((c: any) => ({
          courierId: c.courier_company_id,
          courierName: c.courier_name,
          estimatedDays: c.estimated_delivery_days,
          rate: c.rate,
          codCharges: c.cod_charges
        }))
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create Order
  async createOrder(params: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/external/orders/create/adhoc', params);

      return {
        orderId: response.data.order_id,
        shipmentId: response.data.shipment_id,
        status: response.data.status
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create Shipment (Generate AWB)
  async createShipment(params: { shipmentId: number; courierId: number }): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/external/courier/assign/awb', {
        shipment_id: params.shipmentId,
        courier_id: params.courierId
      });

      const data = response.data.response.data;

      return {
        awb: data.awb_code,
        courierId: data.courier_company_id,
        courierName: data.courier_name,
        pickupScheduledDate: data.pickup_scheduled_date,
        estimatedDelivery: null,
        labelUrl: null
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generate Label
  async generateLabel(shipmentId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/external/courier/generate/label', {
        shipment_id: [parseInt(shipmentId)]
      });

      return {
        labelUrl: response.data.label_url,
        manifestUrl: response.data.manifest_url
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Track Shipment
  async trackShipment(awb: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/external/courier/track/awb/${awb}`);

      return {
        trackingData: response.data.tracking_data,
        activities: response.data.tracking_data.shipment_track_activities || []
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel Shipment
  async cancelShipment(shipmentIds: number[]): Promise<boolean> {
    try {
      await this.axiosInstance.post('/external/orders/cancel', {
        ids: shipmentIds
      });
      return true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Webhook Validation
  validateWebhook(payload: any, signature: string): boolean {
    const secret = SHIPROCKET_CONFIG.WEBHOOK_SECRET;
    if (!secret) return false;

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  // Webhook Normalization
  normalizeWebhook(payload: any): any {
    const statusCode = payload.current_status_code || payload.current_status;

    return {
      eventId: payload.event_id || `${payload.shipment_id}-${Date.now()}`,
      eventType: this.mapEventType(statusCode),
      shipmentId: payload.shipment_id,
      awb: payload.awb,
      status: payload.current_status,
      statusCode: statusCode,
      timestamp: new Date(payload.current_timestamp || payload.event_time || Date.now()),
      location: `${payload.current_wh_city || ''}, ${payload.current_wh_state || ''}`.trim(),
      message: payload.current_status || 'Status update',
      provider: this.providerCode,
      rawPayload: payload
    };
  }

  private mapEventType(statusCode: string): string {
    const rtoStatuses = ['11', '12', '13', '19'];
    const ndrStatuses = ['17'];
    const deliveredStatuses = ['10'];
    const inTransitStatuses = ['8', '27'];
    const outForDeliveryStatuses = ['9'];
    const pickupStatuses = ['2', '3', '4', '24'];

    if (deliveredStatuses.includes(statusCode)) return 'DELIVERED';
    if (rtoStatuses.includes(statusCode)) return 'RTO';
    if (ndrStatuses.includes(statusCode)) return 'NDR';
    if (outForDeliveryStatuses.includes(statusCode)) return 'OUT_FOR_DELIVERY';
    if (inTransitStatuses.includes(statusCode)) return 'IN_TRANSIT';
    if (pickupStatuses.includes(statusCode)) return 'PICKED_UP';

    return 'IN_TRANSIT';
  }

  private handleError(error: any): Error {
    const message = error.response?.data?.message || error.message || 'Shiprocket API error';
    return new Error(message);
  }
}
