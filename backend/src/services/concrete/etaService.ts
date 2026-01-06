import { CourierModel, ShipmentModel } from '../../db/mongodb';
import { IEtaResult } from '../../interfaces/eta';
import { IEtaService } from '../contracts/etaServiceInterface';

export class EtaService implements IEtaService {
  
  async calculateETA(
    destinationPincode: string,
    courierId?: string,
    pickupPincode: string = '110001' // Default warehouse pincode if not provided
  ): Promise<IEtaResult | IEtaResult[]> {
    if (courierId) {
      return this.calculateForCourier(courierId, destinationPincode, pickupPincode);
    }

    const couriers = await CourierModel.find({ isActive: true }).lean();
    
    const results = await Promise.all(
      couriers.map(async (courier: any) => {
        try {
          return await this.calculateForCourier(courier._id.toString(), destinationPincode, pickupPincode, courier);
        } catch (e) {
          return null;
        }
      })
    );

    return results.filter(r => r !== null) as IEtaResult[];
  }

  private async calculateForCourier(
    courierId: string, 
    destinationPincode: string, 
    pickupPincode: string,
    courierModel?: any
  ): Promise<IEtaResult> {
    const courier = courierModel || await CourierModel.findById(courierId).lean();
    if (!courier) throw new Error('Courier not found');
    
    // 1. Base Days (Average SLA)
    const slaMin = courier.slaMin || 2;
    const slaMax = courier.slaMax || 6;
    let estimatedDays = Math.ceil((slaMin + slaMax) / 2);
    
    // 2. Zone Adjustment (Proxy)
    const zoneDiff = Math.abs(parseInt(destinationPincode[0]) - parseInt(pickupPincode[0]));
    const distanceFactor = zoneDiff === 0 ? -1 : Math.ceil(zoneDiff / 2);
    estimatedDays += distanceFactor;

    // 3. Historical Data Adjustment (Closed Loop)
    const history = await this.getHistoricalPerformance(courierId, destinationPincode);
    if (history.avgDays > 0) {
      // Blend SLA with History (60/40 weight)
      estimatedDays = Math.round((estimatedDays * 0.4) + (history.avgDays * 0.6));
    }

    // 4. Seasonality/Buffer (e.g., +1 day during festive season)
    const buffer = this.getSeasonalBuffer();
    estimatedDays += buffer;

    // Minimum 1 day delivery
    estimatedDays = Math.max(1, estimatedDays);

    const today = new Date();
    const expectedDeliveryDate = new Date(today);
    expectedDeliveryDate.setDate(today.getDate() + estimatedDays);

    return {
      courierName: courier.name,
      courierId: courier._id.toString(),
      estimatedDays,
      confidence: history.confidence,
      expectedDeliveryDate
    };
  }

  private async getHistoricalPerformance(courierId: string, pincode: string): Promise<{ avgDays: number, confidence: 'LOW' | 'MEDIUM' | 'HIGH' }> {
    // Look at last 100 shipments for this courier to this pincode zone
    const zonePrefix = pincode.substring(0, 3);
    const shipments = await ShipmentModel.find({
      courierId,
      'deliveryAddress.pincode': { $regex: new RegExp(`^${zonePrefix}`) },
      actualDeliveryDate: { $exists: true },
      pickupCompletedDate: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('actualDeliveryDate pickupCompletedDate')
    .lean();

    if (shipments.length === 0) {
      return { avgDays: 0, confidence: 'LOW' };
    }

    let totalDays = 0;
    shipments.forEach((s: any) => {
      const diffTime = Math.abs(s.actualDeliveryDate.getTime() - s.pickupCompletedDate.getTime());
      totalDays += Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    });

    const avgDays = totalDays / shipments.length;
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (shipments.length >= 20) confidence = 'HIGH';
    else if (shipments.length >= 5) confidence = 'MEDIUM';

    return { avgDays, confidence };
  }

  private getSeasonalBuffer(): number {
    // Logic for peak traffic periods (Diwali, Christmas, Sales)
    const month = new Date().getMonth(); // 0-indexed
    if ([9, 10, 11].includes(month)) return 1; // Oct-Dec festive buffer
    return 0;
  }
}

export const etaService = new EtaService();

