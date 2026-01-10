import { MongooseCommonService } from './mongooseCommonService';
import { IWhatsAppRiskEventAttributes, IWhatsAppRiskEventDocument } from '../../interfaces';
import { IWhatsAppRiskServiceContract } from '../contracts/whatsAppRiskServiceInterface';
import { WhatsAppRiskEventModel, WhatsAppAccountModel } from '../../db/mongodb';
import { WHATSAPP_RISK_EVENT_TYPE } from '../../constants';
import { whatsAppAccountService } from './whatsAppAccountService';
import { logger } from '../../configs/logger';

interface RiskEventPoints {
  [WHATSAPP_RISK_EVENT_TYPE.FAST_SEND]: number;
  [WHATSAPP_RISK_EVENT_TYPE.NO_REPLY]: number;
  [WHATSAPP_RISK_EVENT_TYPE.USER_BLOCK]: number;
  [WHATSAPP_RISK_EVENT_TYPE.USER_REPORT]: number;
  [WHATSAPP_RISK_EVENT_TYPE.REPLY_RECEIVED]: number;
  [WHATSAPP_RISK_EVENT_TYPE.SEND_FAILURE]: number;
  [WHATSAPP_RISK_EVENT_TYPE.AUTH_FAILURE]: number;
  [WHATSAPP_RISK_EVENT_TYPE.DISCONNECTED_BANNED]: number;
  [WHATSAPP_RISK_EVENT_TYPE.STOP_REQUEST]: number;
}

export class WhatsAppRiskService extends MongooseCommonService<IWhatsAppRiskEventAttributes, IWhatsAppRiskEventDocument> implements IWhatsAppRiskServiceContract {
  private get accountService() { return whatsAppAccountService; }

  // Risk event point values
  private static readonly RISK_POINTS: RiskEventPoints = {
    [WHATSAPP_RISK_EVENT_TYPE.FAST_SEND]: 2,
    [WHATSAPP_RISK_EVENT_TYPE.NO_REPLY]: 3,
    [WHATSAPP_RISK_EVENT_TYPE.USER_BLOCK]: 20,
    [WHATSAPP_RISK_EVENT_TYPE.USER_REPORT]: 30,
    [WHATSAPP_RISK_EVENT_TYPE.REPLY_RECEIVED]: -5,
    [WHATSAPP_RISK_EVENT_TYPE.SEND_FAILURE]: 1,
    [WHATSAPP_RISK_EVENT_TYPE.AUTH_FAILURE]: 10,
    [WHATSAPP_RISK_EVENT_TYPE.DISCONNECTED_BANNED]: 50,
    [WHATSAPP_RISK_EVENT_TYPE.STOP_REQUEST]: 15,
  };

  constructor() {
    super(WhatsAppRiskEventModel);
  }

  /**
   * Log a risk event (Contract)
   */
  async logEvent(accountId: string, eventType: string, points: number, metadata?: any): Promise<IWhatsAppRiskEventDocument> {
      const event = await this.create({
          accountId,
          eventType,
          points,
          timestamp: new Date(),
          metadata
      } as any);
      await this.accountService.updateRiskScore(accountId, points);
      return event as unknown as IWhatsAppRiskEventDocument;
  }
  
  async getAccountRiskScore(accountId: string): Promise<number> {
      const account = await this.accountService.getAccount(accountId);
      return account?.riskScore || 0;
  }

  /**
   * Log a risk event and update account risk score (Legacy support if needed)
   */
  async logRiskEvent(
    accountId: string,
    eventType: WHATSAPP_RISK_EVENT_TYPE,
    metadata?: Record<string, any>
  ): Promise<void> {
    const points = WhatsAppRiskService.RISK_POINTS[eventType];
    await this.logEvent(accountId, eventType, points, metadata);

    logger.info(`[WhatsAppRiskService] Logged ${eventType} event for account ${accountId}: ${points > 0 ? '+' : ''}${points} points`);
  }

  /**
   * Check account status and update if needed based on risk score
   */
  async checkAndUpdateAccountStatus(accountId: string): Promise<void> {
    // This is now handled automatically in WhatsAppAccountService.updateRiskScore
    // Kept for API compatibility
    const account = await this.accountService.getAccount(accountId);
    if (account) {
      await this.accountService.updateRiskScore(accountId, 0); // Trigger status check with 0 delta
    }
  }

  /**
   * Decay risk scores for all accounts (reduce by 1 point per day)
   */
  async decayRiskScores(): Promise<void> {
    const accounts = await this.accountService.findAll({ riskScore: { $gt: 0 } } as any);

    for (const account of accounts) {
      await this.accountService.updateRiskScore(account._id.toString(), -1);
    }

    logger.info(`[WhatsAppRiskService] Decayed risk scores for ${accounts.length} accounts`);
  }

  /**
   * Get global average risk score across all active accounts
   */
  async getGlobalRiskAverage(): Promise<number> {
    const result = await this.accountService.aggregate([
      {
        $group: {
          _id: null,
          averageRisk: { $avg: '$riskScore' },
        },
      },
    ] as any);

    return result.length > 0 ? (result[0].averageRisk as number) : 0;
  }

  /**
   * Get high-risk accounts (risk score >= threshold)
   */
  async getHighRiskAccounts(threshold: number = 40): Promise<any[]> {
    return await this.accountService.findAll(
      { riskScore: { $gte: threshold } } as any,
      { sort: { riskScore: -1 } } as any
    );
  }

  /**
   * Get risk events for an account
   */
  async getAccountRiskEvents(accountId: string, limit: number = 50): Promise<any[]> {
    return await this.findAll(
      { accountId } as any,
      { sort: { timestamp: -1 }, limit } as any
    );
  }

  /**
   * Get recent risk events across all accounts
   */
  async getRecentRiskEvents(limit: number = 100): Promise<any[]> {
    return await this.findAll(
      {} as any,
      {
        sort: { timestamp: -1 },
        limit,
        populate: [{ path: 'accountId', select: 'number status riskScore' }]
      } as any
    );
  }

  /**
   * Get risk breakdown by event type
   */
  async getRiskBreakdown(): Promise<any> {
    const breakdown = await this.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ] as any);

    return breakdown;
  }
}
export const whatsAppRiskService = new WhatsAppRiskService();
