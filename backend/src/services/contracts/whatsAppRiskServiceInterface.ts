import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IWhatsAppRiskEventAttributes, IWhatsAppRiskEventDocument } from '../../interfaces';

export interface IWhatsAppRiskServiceContract extends IMongooseCommonService<IWhatsAppRiskEventAttributes, IWhatsAppRiskEventDocument> {
    logEvent(accountId: string, eventType: string, points: number, metadata?: any): Promise<IWhatsAppRiskEventDocument>;
    getAccountRiskScore(accountId: string): Promise<number>;
    getGlobalRiskAverage(): Promise<number>;
    getHighRiskAccounts(threshold?: number): Promise<any[]>;
    getRiskBreakdown(): Promise<any[]>;
}
