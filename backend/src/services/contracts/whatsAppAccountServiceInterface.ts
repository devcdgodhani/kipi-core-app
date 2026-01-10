import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IWhatsAppAccountAttributes, IWhatsAppAccountDocument } from '../../interfaces';

export interface IWhatsAppAccountServiceContract extends IMongooseCommonService<IWhatsAppAccountAttributes, IWhatsAppAccountDocument> {
    initializeSession(accountId: string): Promise<IWhatsAppAccountDocument>;
    logoutSession(accountId: string): Promise<IWhatsAppAccountDocument>;
    terminateSession(accountId: string): Promise<IWhatsAppAccountDocument>;
    pauseAccount(accountId: string): Promise<IWhatsAppAccountDocument>;
    resumeAccount(accountId: string): Promise<IWhatsAppAccountDocument>;
    disableAccount(accountId: string): Promise<IWhatsAppAccountDocument>;
    // Queue messaging methods
    enqueueMessage(accountId: string, to: string, content: any): Promise<void>;
    enqueueBulkMessage(accountId: string, recipients: string[], content: any): Promise<void>;
}
