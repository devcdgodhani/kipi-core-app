import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IWhatsAppContactAttributes, IWhatsAppContactDocument } from '../../interfaces';

export interface IWhatsAppContactServiceContract extends IMongooseCommonService<IWhatsAppContactAttributes, IWhatsAppContactDocument> {
    updateConsent(contactId: string, consent: boolean): Promise<IWhatsAppContactDocument | null>;
    markAsDND(contactId: string): Promise<IWhatsAppContactDocument | null>;
    findOrRegister(mobile: string, name?: string): Promise<IWhatsAppContactDocument>;
}
