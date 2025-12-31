import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { Document } from 'mongoose';
import { WhatsAppSessionModel } from '../../db/mongodb/models/whatsAppSessionModel';
import { IWhatsAppSessionAttributes, IWhatsAppSessionDocument } from '../../interfaces';
import { WHATSAPP_SESSION_STATUS } from '../../constants';
import { getTime } from 'date-fns';
import { MongooseCommonService } from './mongooseCommonService';
import { APP_DETAILS } from '../../constants';
import { IWhatsAppService } from '../contracts/whatsAppServiceInterface';

export class WhatsAppService extends MongooseCommonService<IWhatsAppSessionAttributes, IWhatsAppSessionDocument> implements IWhatsAppService {
  private static clients: Map<string, Client> = new Map();

  constructor() {
    super(WhatsAppSessionModel);
  }

  /**
   * Initialize all sessions that have isAutoResume set to true
   */
  async initializeAllSessions() {
    console.log('Initializing WhatsApp sessions...');
    const sessions = await this.findAll({});
    const resumeSessions = sessions.filter(s => s.isAutoResume && s.isActive);
    for (const session of resumeSessions) {
      try {
        await this.startClient(session);
      } catch (err) {
        console.error(`Failed to start client for session ${session.name}:`, err);
      }
    }
  }

  /**
   * Start a specific client
   */
  async startClient(session: IWhatsAppSessionAttributes) {
    if (WhatsAppService.clients.has(session._id.toString())) {
      console.log(`Client for session ${session.name} already exists.`);
      return;
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: session.externalId,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
    });

    this.setupEventListeners(client, session);
    client.initialize().catch((err) => {
      console.error(`Initialization error for ${session.name}:`, err);
    });
    
    WhatsAppService.clients.set(session._id.toString(), client);
  }

  private setupEventListeners(client: Client, session: IWhatsAppSessionAttributes) {
    const sessionId = session._id.toString();

    client.on('qr', async (qr) => {
      console.log(`QR received for ${session.name}`);
      const qrDataUrl = await QRCode.toDataURL(qr);
      await this.updateOne(
        { _id: sessionId },
        { 
          status: WHATSAPP_SESSION_STATUS.QR_READY, 
          qrCode: qrDataUrl 
        },
        { userId: session._id as any }
      );
    });

    client.on('ready', async () => {
      console.log(`Client is ready for ${session.name}`);
      await this.updateOne(
        { _id: sessionId },
        { 
          status: WHATSAPP_SESSION_STATUS.CONNECTED, 
          qrCode: '', 
          lastActiveAt: getTime(new Date()) 
        },
        { userId: session._id as any }
      );
    });

    client.on('authenticated', () => {
      console.log(`Authenticated for ${session.name}`);
    });

    client.on('auth_failure', async (msg) => {
      console.error(`Auth failure for ${session.name}: ${msg}`);
      await this.updateOne(
        { _id: sessionId },
        { status: WHATSAPP_SESSION_STATUS.DISCONNECTED, qrCode: '' },
        { userId: session._id as any }
      );
    });

    client.on('disconnected', async (reason) => {
      console.log(`Disconnected for ${session.name}: ${reason}`);
      await this.updateOne(
        { _id: sessionId },
        { status: WHATSAPP_SESSION_STATUS.DISCONNECTED, qrCode: '' },
        { userId: session._id as any }
      );
    });
  }

  async logoutSession(sessionId: string) {
    const client = WhatsAppService.clients.get(sessionId);
    if (client) {
      try {
        await client.logout();
        await client.destroy();
      } catch (err) {
        console.error(`Error logging out session ${sessionId}:`, err);
      }
      WhatsAppService.clients.delete(sessionId);
    }
    await this.updateOne(
        { _id: sessionId },
        { status: WHATSAPP_SESSION_STATUS.DISCONNECTED, qrCode: '' },
        { userId: sessionId as any }
      );
  }


  async sendMessage(sessionId: string, to: string, message: string) {
    const client = WhatsAppService.clients.get(sessionId);
    if (!client) throw new Error('Session not active');
    
    // Format number (simplified version)
    const formattedTo = to.includes('@c.us') ? to : `${to}@c.us`;
    return await client.sendMessage(formattedTo, message);
  }

  async sendBulkMessage(sessionId: string, numbers: string[], message: string) {
    const results = [];
    for (const num of numbers) {
      try {
        await this.sendMessage(sessionId, num, message);
        results.push({ number: num, status: 'success' });
      } catch (err: any) {
        results.push({ number: num, status: 'failed', error: err.message });
      }
      // Add a small delay between messages to avoid being flagged
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return results;
  }
  
  async deleteSessionWithClient(sessionId: string) {
      await this.logoutSession(sessionId);
      return await this.delete({ _id: sessionId });
  }

  async sendOtpViaWhatsApp(mobile: string, otp: string) {
      try {
          // Find any active/connected session
          const activeSession = await this.findOne({ status: WHATSAPP_SESSION_STATUS.CONNECTED });
          if (!activeSession) {
              console.log('No active WhatsApp session found to send OTP');
              return;
          }

          const message = `Your OTP for ${APP_DETAILS.APP_NAME} is: ${otp}. Valid for 5 minutes.`;
          await this.sendMessage(activeSession._id.toString(), mobile, message);
          console.log(`OTP sent to ${mobile} via WhatsApp session: ${activeSession.name}`);
      } catch (err) {
          console.error('Error sending WhatsApp OTP:', err);
      }
  }
}
