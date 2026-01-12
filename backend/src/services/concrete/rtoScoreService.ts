import { RtoScoreModel, OrderModel, NDRModel } from '../../db/mongodb';
import { IRtoScoreAttributes, IRtoScoreDocument } from '../../interfaces/rto';
import { IRtoScoreService } from '../contracts/rtoServiceInterface';
import { RTO_RISK_LEVEL } from '../../constants/rto';
import { Types } from 'mongoose';
import { MongooseCommonService } from './mongooseCommonService';
import { userService } from './userService';
import { shipmentService } from './shipmentService';

export class RtoScoreService extends MongooseCommonService<IRtoScoreAttributes, IRtoScoreDocument> implements IRtoScoreService {
  private get userService() { return userService; }
  private get shipmentService() { return shipmentService; }

  constructor() {
    super(RtoScoreModel as any);
  }

  async getStats(): Promise<any> {
    const [
      highRiskCount,
      criticalRiskCount,
      totalOrders,
      rtoOrders,
      activeNdrs,
      deliveredOrders
    ] = await Promise.all([
      this.model.countDocuments({ riskLevel: RTO_RISK_LEVEL.HIGH }),
      this.model.countDocuments({ riskLevel: RTO_RISK_LEVEL.CRITICAL }),
      OrderModel.countDocuments({}),
      OrderModel.countDocuments({ isRTO: true }),
      NDRModel.countDocuments({ status: { $ne: 'RESOLVED' } }),
      OrderModel.countDocuments({ orderStatus: 'DELIVERED', isRTO: { $ne: true } })
    ]);

    const rtoRate = totalOrders > 0 ? (rtoOrders / totalOrders) * 100 : 0;

    return {
      rtoRate: parseFloat(rtoRate.toFixed(1)),
      highRiskOrders: highRiskCount + criticalRiskCount,
      activeNdrs,
      safeDeliveries: deliveredOrders,
      totalRtoConfigured: highRiskCount + criticalRiskCount // Keeping consistency with UI mock
    };
  }
  
  /**
    * Calculates the RTO Risk Score for an order BEFORE it is placed (or during confirmation)
    */
  async calculateRiskScore(
    userId: string, 
    pincode: string, 
    orderAmount: number, 
    paymentMethod: string
  ): Promise<IRtoScoreAttributes> {
    const user = await this.userService.findById(userId) as any;
    
    // 1. Customer History Factor (0-100)
    const customerHistoryRisk = await this.calculateCustomerHistoryRisk(user);
    
    // 2. Pincode Risk Factor (0-100)
    const pincodeRisk = await this.calculatePincodeRisk(pincode);
    
    // 3. Order Value Risk Factor (0-100)
    const orderValueRisk = (paymentMethod === 'COD' && orderAmount > 5000) ? 70 : 0;
    
    // 4. Account Age Risk Factor (0-100)
    let accountAgeRisk = 0;
    if (user && user.createdAt) {
      const ageInDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 30) accountAgeRisk = 40;
    } else {
      accountAgeRisk = 50; // New/Guest user
    }

    // --- Weighted Scoring Logic ---
    let riskScore = 0;
    
    // Rule 1: New Account penalty
    if (accountAgeRisk > 0) riskScore += 30;
    
    // Rule 2: History penalty (Major red flag)
    if (customerHistoryRisk > 80) riskScore += 50;
    else if (customerHistoryRisk > 50) riskScore += 20;
    
    // Rule 3: High Value COD penalty
    if (orderValueRisk > 0) riskScore += 20;
    
    // Rule 4: Blacklisted/High-Risk Pincode (Overriding)
    if (pincodeRisk > 80) riskScore = 100; // Immediate Critical

    riskScore = Math.min(100, riskScore);

    // Determine Risk Level
    let riskLevel: IRtoScoreAttributes['riskLevel'] = RTO_RISK_LEVEL.LOW;
    if (riskScore >= 90) riskLevel = RTO_RISK_LEVEL.CRITICAL;
    else if (riskScore >= 60) riskLevel = RTO_RISK_LEVEL.HIGH;
    else if (riskScore >= 30) riskLevel = RTO_RISK_LEVEL.MEDIUM;

    // Determine Suggested Action
    let suggestedAction: IRtoScoreAttributes['suggestedAction'] = 'ALLOW';
    if (riskLevel === RTO_RISK_LEVEL.CRITICAL && paymentMethod === 'COD') {
      suggestedAction = 'BLOCK_COD';
    } else if (riskLevel === RTO_RISK_LEVEL.HIGH || riskLevel === RTO_RISK_LEVEL.MEDIUM) {
      suggestedAction = 'FLAG';
    }

    return {
      orderId: null as any, // Filled during saveRiskScore
      customerId: new Types.ObjectId(userId),
      riskScore,
      totalScore: riskScore, // Assuming totalScore is riskScore for now
      riskLevel,
      factors: {
        customerHistory: customerHistoryRisk,
        pincodeRisk,
        orderValueRisk,
        accountAgeRisk
      },
      suggestedAction
    };
  }

  /**
    * Persists the risk score in the database
    */
  async saveRiskScore(scoreData: IRtoScoreAttributes): Promise<IRtoScoreDocument> {
    return await this.create(scoreData) as any;
  }

  private async calculateCustomerHistoryRisk(user: any): Promise<number> {
    if (!user || !user.metrics || user.metrics.totalOrders === 0) return 40; // Neutral-Medium risk
    
    const { totalOrders, rtoCount } = user.metrics;
    const rtoRate = (rtoCount / totalOrders) * 100;
    
    if (rtoCount > 0) return 90; // Red flag
    if (rtoRate === 0 && totalOrders > 2) return 0; // Good history
    
    return 20;
  }

  private async calculatePincodeRisk(pincode: string): Promise<number> {
    // Prototype: Static high-risk zones (could be moved to a DB collection or Config)
    const highRiskZones = ['201301', '110001', '400001']; 
    if (highRiskZones.includes(pincode)) return 100;
 
    const shipments = await this.shipmentService.findAll({ 'deliveryAddress.pincode': pincode } as any, { limit: 50 });
    if (shipments.length < 5) return 10;

    const rtoCount = shipments.filter((s: any) => s.isRTO).length;
    return Math.round((rtoCount / shipments.length) * 100);
  }
}

export const rtoScoreService = new RtoScoreService();
