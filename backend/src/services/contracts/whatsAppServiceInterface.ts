import { IWhatsAppSessionAttributes } from '../../interfaces';
import { IPaginationData } from '../../interfaces/common';

export interface IWhatsAppService {
  // Session management
  createSession(data: Partial<IWhatsAppSessionAttributes>): Promise<IWhatsAppSessionAttributes>;
  getSessions(): Promise<IWhatsAppSessionAttributes[]>;
  getSessionById(id: string): Promise<IWhatsAppSessionAttributes | null>;
  deleteSession(id: string): Promise<boolean>;
  
  // WhatsApp Logic
  initializeAllSessions(): Promise<void>;
  initializeSession(sessionId: string): Promise<void>;
  logoutSession(sessionId: string): Promise<void>;
  
  // Messaging
  sendMessage(sessionId: string, to: string, message: string): Promise<any>;
  sendBulkMessage(sessionId: string, numbers: string[], message: string): Promise<any>;
}
