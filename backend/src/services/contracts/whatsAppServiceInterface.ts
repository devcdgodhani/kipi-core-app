import { IWhatsAppSessionAttributes, IWhatsAppSessionDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IWhatsAppService extends IMongooseCommonService<IWhatsAppSessionAttributes, IWhatsAppSessionDocument> {
  initializeAllSessions(): Promise<void>;
  startClient(session: IWhatsAppSessionAttributes): Promise<void>;
  logoutSession(sessionId: string): Promise<void>;
  sendMessage(sessionId: string, to: string, message: string): Promise<any>;
  sendBulkMessage(sessionId: string, numbers: string[], message: string): Promise<any>;
  deleteSessionWithClient(sessionId: string): Promise<any>;
  sendOtpViaWhatsApp(mobile: string, otp: string): Promise<void>;
}
