import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IWhatsAppMessageAttributes, IWhatsAppMessageDocument } from '../../interfaces';

export interface IWhatsAppMessageServiceContract extends IMongooseCommonService<IWhatsAppMessageAttributes, IWhatsAppMessageDocument> {
    logMessage(data: Partial<IWhatsAppMessageAttributes> & { accountId: string }): Promise<IWhatsAppMessageDocument>;
    markAsDelivered(messageId: string): Promise<IWhatsAppMessageDocument | null>;
    markAsRead(messageId: string): Promise<IWhatsAppMessageDocument | null>;
    markAsFailed(messageId: string, error: string): Promise<IWhatsAppMessageDocument | null>;
}
