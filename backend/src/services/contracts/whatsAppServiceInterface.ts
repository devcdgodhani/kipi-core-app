import { IMongooseCommonService } from './mongooseCommonServiceInterface';
import { IWhatsAppAccountAttributes, IWhatsAppAccountDocument } from '../../interfaces';

export interface IWhatsAppService extends IMongooseCommonService<IWhatsAppAccountAttributes, IWhatsAppAccountDocument> {
  initializeAllAccounts(): Promise<void>;
  startClient(account: IWhatsAppAccountAttributes): Promise<void>;
  logoutAccount(accountId: string): Promise<void>;
  sendMessage(accountId: string, to: string, message: string): Promise<any>;
  enqueueMessage(
    mobile: string,
    message: string,
    options?: { templateId?: string; delay?: number }
  ): Promise<string>;
  enqueueMessages(
    recipients: Array<{ mobile: string; message: string }>,
    options?: { templateId?: string }
  ): Promise<string[]>;
  sendAutomatedMessage(mobile: string, message: string): Promise<void>;
  sendOtpViaWhatsApp(mobile: string, otp: string): Promise<void>;
}
