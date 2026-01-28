import { Client, LocalAuth } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../configs/logger';

import { MongooseCommonService } from './mongooseCommonService';
import { WhatsAppAccountModel } from '../../db/mongodb';
import { IWhatsAppAccountAttributes, IWhatsAppAccountDocument } from '../../interfaces';
import { WHATSAPP_ACCOUNT_STATUS, WHATSAPP_CONNECTION_STATUS, APP_DETAILS } from '../../constants';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { notificationQueue } from '../../jobs/notification/queue';
import { whatsAppContactService } from './whatsAppContactService';
import { whatsAppMessageService } from './whatsAppMessageService';
import { whatsAppThrottleService } from './whatsAppThrottleService';
import { whatsAppRiskService } from './whatsAppRiskService';
import { IWhatsAppAccountServiceContract } from '../contracts/whatsAppAccountServiceInterface';
import { WHATSAPP_RISK_EVENT_TYPE } from '../../constants';

export class WhatsAppAccountService extends MongooseCommonService<IWhatsAppAccountAttributes, IWhatsAppAccountDocument> implements IWhatsAppAccountServiceContract {
  public static clients: Map<string, Client> = new Map();

  constructor() {
    super(WhatsAppAccountModel);
  }

  /**
   * Initialize all active accounts on startup
   */
  async initializeAllAccounts() {
    logger.info('Initializing WhatsApp accounts...');

    // Reset any accounts that were stuck in transition states
    await this.update(
      { socketStatus: { $in: [WHATSAPP_CONNECTION_STATUS.INITIALIZING, WHATSAPP_CONNECTION_STATUS.QR_READY] } } as any,
      { $set: { socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED, qrCode: null, number: null } } as any
    );
    
    // Only auto-resume accounts that were previously CONNECTED
    const accounts = await this.findAll({
      isAutoResume: true,
      socketStatus: WHATSAPP_CONNECTION_STATUS.CONNECTED
    } as any);
    
    logger.info(`Found ${accounts.length} previously connected accounts to resume.`);
    
    for (const account of accounts) {
      await this.startClient(account);
    }
  }

  /**
   * Start a WhatsApp client for a specific account
   */
  async startClient(account: any) {
    logger.info(`[WhatsAppAccountService] Starting client for account: ${account.name} (ID: ${account._id})`);
    
    // Stop existing client if running
    const existingClient = WhatsAppAccountService.clients.get(account._id.toString());
    if (existingClient) {
      logger.info(`[WhatsAppAccountService] Stopping existing client for ${account.name}`);
      try {
        await existingClient.destroy();
      } catch (err) {
        logger.error(`[WhatsAppAccountService] Error stopping client:`, err);
      }
      WhatsAppAccountService.clients.delete(account._id.toString());
    }

    // Update status to initializing
    await this.updateOne(
      { _id: account._id } as any,
      { socketStatus: WHATSAPP_CONNECTION_STATUS.INITIALIZING, qrCode: null } as any
    );

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: account.externalId,
        dataPath: './.wwebjs_auth'
      }),
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      },
      puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      }
    });

    logger.info(`[WhatsAppAccountService] Client created for ${account.name}. Starting initialization...`);
    this.setupEventListeners(client, account);
    
    WhatsAppAccountService.clients.set(account._id.toString(), client);
    logger.info(`[WhatsAppAccountService] Starting client.initialize() for ${account.name}`);
    client.initialize().catch(err => {
      logger.error(`[WhatsAppAccountService] Client initialization error for ${account.name}:`, err);
      this.updateOne(
        { _id: account._id } as any,
        { socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED } as any
      ).catch(e => logger.error(`[WhatsAppAccountService] Failed to update error status for ${account.name}:`, e));
    });
  }

  private setupEventListeners(client: Client, account: IWhatsAppAccountAttributes) {
    // QR Code generated
    client.on('qr', async (qr) => {
      logger.info(`[WhatsAppAccountService] QR Code received for ${account.name}`);
      try {
        const qrDataUrl = await QRCode.toDataURL(qr);
        await this.updateOne(
          { _id: account._id } as any,
          { 
            qrCode: qrDataUrl,
            socketStatus: WHATSAPP_CONNECTION_STATUS.QR_READY
          } as any
        );
        logger.info(`[WhatsAppAccountService] Saved converted QR code for ${account.name}`);
      } catch (err) {
        logger.error(`[WhatsAppAccountService] Error generating QR Data URL for ${account.name}:`, err);
      }
    });

    client.on('authenticated', async () => {
      logger.info(`[WhatsAppAccountService] Authenticated event for ${account.name}`);
      await this.updateOne(
        { _id: account._id } as any,
        { 
          socketStatus: WHATSAPP_CONNECTION_STATUS.CONNECTED,
          isAuthenticated: true,
          qrCode: null 
        } as any
      );
      logger.info(`[WhatsAppAccountService] Updated status to CONNECTED via authenticated event for ${account.name}`);
    });

    client.on('auth_failure', async (msg) => {
      logger.error(`[WhatsAppAccountService] Authentication failure for ${account.name}:`, msg);
      
      // Log risk event
      try {
        await whatsAppRiskService.logRiskEvent(account._id.toString(), WHATSAPP_RISK_EVENT_TYPE.AUTH_FAILURE, { message: msg });
      } catch (err) {
        logger.error(`[WhatsAppAccountService] Error logging auth failure risk for ${account.name}:`, err);
      }

      await this.updateOne(
        { _id: account._id } as any,
        { 
          socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED,
          isAuthenticated: false,
          qrCode: null
        } as any
      );
    });

    client.on('ready', async () => {
      logger.info(`[WhatsAppAccountService] Ready event for ${account.name}`);
      const info = client.info;
      const number = info.wid.user;

      try {
        await this.updateOne(
          { _id: account._id } as any,
          { 
            socketStatus: WHATSAPP_CONNECTION_STATUS.CONNECTED,
            qrCode: null,
            isAuthenticated: true,
            number: number,
            activatedAt: new Date()
          } as any
        );
        logger.info(`[WhatsAppAccountService] Confirmed status CONNECTED via ready event for ${account.name} (Number: ${number})`);
      } catch (err: any) {
        if (err.code === 11000) {
          logger.warn(`[WhatsAppAccountService] Duplicate number detected for ${account.name} (${number}). Cleaning up conflict...`);
          
          // Find the account that already has this number and clear it
          await this.update(
            { number: number, _id: { $ne: account._id } } as any,
            { $set: { number: null, socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED, isAuthenticated: false } } as any
          );

          // Retry the update for current account
          await this.updateOne(
            { _id: account._id } as any,
            { 
              socketStatus: WHATSAPP_CONNECTION_STATUS.CONNECTED,
              qrCode: null,
              isAuthenticated: true,
              number: number,
              activatedAt: new Date()
            } as any
          );
          logger.info(`[WhatsAppAccountService] Resolved duplicate number conflict and updated ${account.name}`);
        } else {
          logger.error(`[WhatsAppAccountService] Error updating ready status for ${account.name}:`, err);
        }
      }
    });

    client.on('disconnected', async (reason) => {
      logger.info(`[WhatsAppAccountService] Disconnected event for ${account.name}. Reason: ${reason}`);
      
      // Check for potential ban (DISCONNECTED_BANNED is a placeholder for server-side forced disconnects)
      if (reason && (reason as any) !== 'NAVIGATION' && (reason as any) !== 'SESSION_LOGOUT') {
        try {
          await whatsAppRiskService.logRiskEvent(account._id.toString(), WHATSAPP_RISK_EVENT_TYPE.DISCONNECTED_BANNED, { reason });
        } catch (err) {
          logger.error(`[WhatsAppAccountService] Error logging disconnection risk for ${account.name}:`, err);
        }
      }

      await this.updateOne(
        { _id: account._id } as any,
        { 
          socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED,
          isAuthenticated: false,
          qrCode: null
        } as any
      );
      WhatsAppAccountService.clients.delete(account._id.toString());
    });

    client.on('change_state', async (state) => {
       logger.info(`[WhatsAppAccountService] State change for ${account.name}: ${state}`);
       
       let socketStatus: WHATSAPP_CONNECTION_STATUS | null = null;
       let isAuthenticated = true;

       if (state === 'CONNECTED') {
         socketStatus = WHATSAPP_CONNECTION_STATUS.CONNECTED;
       } else if (state === 'UNPAIRED' || state === 'UNLAUNCHED') {
         socketStatus = WHATSAPP_CONNECTION_STATUS.DISCONNECTED;
         isAuthenticated = false;
         WhatsAppAccountService.clients.delete(account._id.toString());
       } else if (state === 'CONFLICT' || state === 'TIMEOUT') {
         socketStatus = WHATSAPP_CONNECTION_STATUS.DISCONNECTED;
       }

       if (socketStatus) {
         await this.updateOne(
           { _id: account._id } as any,
           { socketStatus, isAuthenticated } as any
         );
         logger.info(`[WhatsAppAccountService] Synced state ${state} to socketStatus ${socketStatus} for ${account.name}`);
       }
    });

    client.on('loading_screen', (percent, message) => {
       logger.info(`[WhatsAppAccountService] Loading screen for ${account.name}: ${percent}% - ${message}`);
    });

    client.on('message', (msg) => {
       // logger.info(`[WhatsAppAccountService] Message received for ${account.name} from ${msg.from}`);
    });
  }

  /**
   * Initialize a specific session
   */
  async initializeSession(accountId: string): Promise<IWhatsAppAccountDocument> {
    const account = await WhatsAppAccountModel.findById(accountId);
    if (!account) throw new Error('Account not found');

    // If client exists, do nothing or maybe restart? For now, if connected, just return.
    if (WhatsAppAccountService.clients.has(accountId) && account.socketStatus === WHATSAPP_CONNECTION_STATUS.CONNECTED) {
      return account;
    }

    await this.startClient(account);
    return (await this.findById(accountId)) as unknown as IWhatsAppAccountDocument;
  }

  /**
   * Terminate a session (force cleanup)
   */
  async terminateSession(accountId: string): Promise<IWhatsAppAccountDocument> {
    return this.logoutSession(accountId);
  }

  /**
   * Logout a session
   */
  async logoutSession(accountId: string): Promise<IWhatsAppAccountDocument> {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');

    const client = WhatsAppAccountService.clients.get(accountId);
    
    if (client) {
      try {
        logger.info(`[WhatsAppAccountService] Attempting physical logout for ${account.name}`);
        const isConnected = (client as any).pupBrowser && (client as any).pupBrowser.isConnected();
        if (isConnected) {
            await Promise.race([
              client.logout(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), 5000))
            ]).catch(err => logger.warn(`Logout warning: ${err.message}`));
        }
        await client.destroy();
      } catch (err: any) {
        logger.error(`[WhatsAppAccountService] Error logging out: ${err.message}`);
        try { await client.destroy(); } catch (e) {}
      }
      WhatsAppAccountService.clients.delete(accountId);
    }
    
    // Cleanup disk
    if (account.externalId) {
      this.removeSessionData(account.externalId);
    }
    
    const updated = await this.upsert(
       { _id: accountId } as any,
       { 
         $set: { 
           socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED,
           isAuthenticated: false,
           qrCode: null,
           number: null
         }
       } as any
    );
    
    return updated as unknown as IWhatsAppAccountDocument;
  }

  private removeSessionData(externalId: string) {
    const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${externalId}`);
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        logger.info(`[WhatsAppAccountService] Removed session data for ${externalId} from ${sessionPath}`);
      } catch (err) {
        logger.error(`[WhatsAppAccountService] Failed to remove session data for ${externalId}:`, err);
      }
    }
  }

  /**
   * Terminate client without logging out (just stop the process)
   */
  async terminateClient(accountId: string) {
    const client = WhatsAppAccountService.clients.get(accountId);
    if (client) {
      try {
        await client.destroy();
      } catch (err) {
        logger.error(`Error destroying client for account ${accountId}:`, err);
      }
      WhatsAppAccountService.clients.delete(accountId);
    }
    
    await this.updateOne(
      { _id: accountId } as any,
      { 
        socketStatus: WHATSAPP_CONNECTION_STATUS.DISCONNECTED,
        qrCode: null
      } as any
    );
  }

  /**
   * Delete account and its client
   */
  async deleteAccount(accountId: string) {
    // Attempt full logout before deletion
    await this.logoutSession(accountId);
    return await this.delete({ _id: accountId } as any);
  }

  async sendMessage(accountId: string, to: string, message: string) {
    const client = WhatsAppAccountService.clients.get(accountId);
    if (!client) {
      console.warn(`[WhatsAppAccountService] No active client for account ${accountId}. Attempting to send message failed.`);
      throw new Error('Session not active/found for account');
    }
    if(to.includes('+')) {
      to = to.replace('+', '');
    }
    to='919726176061'
    const formattedTo = to.includes('@c.us') ? to : `${to}@c.us`;
    return await client.sendMessage(formattedTo, message);
  }

  /**
   * Enqueue a single WhatsApp message (queue-based, anti-ban compliant)
   */
  // Renaming original enqueueMessage to avoid conflict or overload
  async enqueueBestEffortMessage(
    mobile: string,
    message: string,
    options?: { templateId?: string; delay?: number }
  ): Promise<string> {
    // 1. Find or create contact
    const contact = await whatsAppContactService.findOrCreateContact(mobile);

    // 2. Check consent
    if (!contact.consent) {
      throw new Error(`Contact ${mobile} has not provided consent for WhatsApp messages`);
    }

    // 3. Select best account
    const account = await this.selectBestAccount();
    if (!account) {
      throw new Error('No active WhatsApp accounts available');
    }

    // 4. Check throttle limits
    const canSend = whatsAppThrottleService.canSendNow(account as any);
    let jobDelay = options?.delay || 0;

    if (!canSend.allowed) {
      if (canSend.nextAvailableAt) {
        jobDelay = whatsAppThrottleService.calculateDelayUntil(canSend.nextAvailableAt);
        logger.info(`[WhatsAppAccountService] Message delayed by ${Math.round(jobDelay / 1000)}s: ${canSend.reason}`);
      } else {
        throw new Error(`Cannot send message: ${canSend.reason}`);
      }
    }

    // 5. Create message record
    const jobId = `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await whatsAppMessageService.createMessage({
      accountId: account._id.toString(),
      contactId: contact._id.toString(),
      message,
      jobId,
      templateId: options?.templateId,
    });

    // 6. Add job to queue
    await notificationQueue.queue.add(
      BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP,
      {
        accountId: account._id.toString(),
        contactId: contact._id.toString(),
        message,
        templateId: options?.templateId,
      },
      {
        jobId,
        delay: jobDelay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000, // 1 minute
        },
      }
    );

    logger.info(`[WhatsAppAccountService] Enqueued message to ${mobile} via account ${account.number} (job: ${jobId}, delay: ${Math.round(jobDelay / 1000)}s)`);
    return jobId;
  }

  async enqueueMessages(
    recipients: Array<{ mobile: string; message: string }>,
    options?: { templateId?: string }
  ): Promise<string[]> {
    const jobIds: string[] = [];
    for (const recipient of recipients) {
      try {
        const jobId = await this.enqueueBestEffortMessage(recipient.mobile, recipient.message, options);
        jobIds.push(jobId);
      } catch (err: any) {
        logger.error(`[WhatsAppAccountService] Failed to enqueue message to ${recipient.mobile}:`, err.message);
      }
    }
    return jobIds;
  }
  
  async sendOtpViaWhatsApp(mobile: string, otp: string) {
      const message = `Your OTP for ${APP_DETAILS.APP_NAME} is: ${otp}. Valid for 5 minutes.`;
      await this.sendAutomatedMessage(mobile, message);
  }

  async sendAutomatedMessage(mobile: string, message: string) {
      try {
          // Use enqueueBestEffortMessage for automatic account selection and anti-ban
          const jobId = await this.enqueueBestEffortMessage(mobile, message);
          logger.info(`Automated message enqueued to ${mobile} (job: ${jobId})`);
      } catch (err) {
          logger.error('Error sending Automated WhatsApp message:', err);
      }
  }

  /**
   * Select the best account for sending based on load balancing criteria
   */
  async selectBestAccount(): Promise<IWhatsAppAccountDocument | null> {
    const account = await this.findOne(
      { status: WHATSAPP_ACCOUNT_STATUS.ACTIVE } as any,
      {
        sort: {
          riskScore: 1,      // Lowest risk first
          sentToday: 1,      // Lowest usage first
          lastSentAt: 1,     // Oldest last send first (null values come first)
        }
      } as any
    );

    return account as unknown as IWhatsAppAccountDocument | null;
  }

  /**
   * Increment message counters for an account
   */
  async incrementCounters(accountId: string): Promise<void> {
    await this.updateOne(
      { _id: accountId } as any,
      {
        $inc: {
          sentToday: 1,
          sentThisHour: 1,
          'metadata.totalSent': 1,
        },
        $set: {
          lastSentAt: new Date(),
        },
      } as any
    );
  }

  /**
   * Update risk score for an account
   */
  async updateRiskScore(accountId: string, delta: number): Promise<void> {
    const account = await this.findById(accountId);
    if (!account) return;

    const newRiskScore = Math.max(0, Math.min(100, account.riskScore + delta));
    
    // Determine new status based on risk score
    let newStatus = account.status;
    if (newRiskScore >= 80) {
      newStatus = WHATSAPP_ACCOUNT_STATUS.BLOCKED;
    } else if (newRiskScore >= 50) {
      newStatus = WHATSAPP_ACCOUNT_STATUS.COOLDOWN;
    } else if (account.status !== WHATSAPP_ACCOUNT_STATUS.ACTIVE && newRiskScore < 50) {
      // Auto-recover from cooldown if risk drops below 50
      newStatus = WHATSAPP_ACCOUNT_STATUS.ACTIVE;
    }

    await this.updateOne(
      { _id: accountId } as any,
      {
        $set: {
          riskScore: newRiskScore,
          status: newStatus,
        },
      } as any
    );

    logger.info(`[WhatsAppAccountService] Updated account ${accountId}: riskScore ${account.riskScore} -> ${newRiskScore}, status ${account.status} -> ${newStatus}`);
  }

  /**
   * Reset daily counters for all accounts (called by cron at midnight)
   */
  async resetDailyCounters(): Promise<void> {
    const result = await this.update(
      {} as any,
      {
        $set: {
          sentToday: 0,
        },
      } as any
    );
    logger.info(`[WhatsAppAccountService] Reset daily counters for ${result?.modifiedCount || 0} accounts`);
  }

  /**
   * Reset hourly counters for all accounts (called by cron every hour)
   */
  async resetHourlyCounters(): Promise<void> {
    const result = await this.update(
      {} as any,
      {
        $set: {
          sentThisHour: 0,
        },
      } as any
    );
    logger.info(`[WhatsAppAccountService] Reset hourly counters for ${result?.modifiedCount || 0} accounts`);
  }

  /**
   * Get all active accounts
   */
    async getAccount(id: string): Promise<IWhatsAppAccountDocument | null> {
        return await this.findById(id) as unknown as IWhatsAppAccountDocument;
    }

    async createAccount(data: Partial<IWhatsAppAccountDocument>): Promise<IWhatsAppAccountDocument> {
        return await this.create(data as any) as unknown as IWhatsAppAccountDocument;
    }

  /**
   * Get all active accounts
   */
  async getActiveAccounts(): Promise<IWhatsAppAccountDocument[]> {
    return await this.findAll({
      status: WHATSAPP_ACCOUNT_STATUS.ACTIVE,
    } as any) as unknown as IWhatsAppAccountDocument[];
  }

   /**
   * Pause an account (set to COOLDOWN)
   */
  async pauseAccount(accountId: string): Promise<IWhatsAppAccountDocument> {
    const updated = await this.upsert(
      { _id: accountId } as any,
      { $set: { status: WHATSAPP_ACCOUNT_STATUS.COOLDOWN } } as any
    );
    if (!updated) throw new Error('Account not found');
    return updated as unknown as IWhatsAppAccountDocument;
  }

  /**
   * Resume an account (set to ACTIVE if risk allows)
   */
  async resumeAccount(accountId: string): Promise<IWhatsAppAccountDocument> {
    const account = await this.findById(accountId);
    if (!account) throw new Error('Account not found');

    if (account.riskScore >= 80) {
      throw new Error('Cannot resume account with risk score >= 80');
    }

    const updated = await this.upsert(
      { _id: accountId } as any,
      { $set: { status: WHATSAPP_ACCOUNT_STATUS.ACTIVE } } as any
    );
    if (!updated) throw new Error('Account not found');
    return updated as unknown as IWhatsAppAccountDocument;
  }

  /**
   * Disable an account (set to BLOCKED)
   */
  async disableAccount(accountId: string): Promise<IWhatsAppAccountDocument> {
    const updated = await this.upsert(
      { _id: accountId } as any,
      { $set: { status: WHATSAPP_ACCOUNT_STATUS.BLOCKED } } as any
    );
    if (!updated) throw new Error('Account not found');
    return updated as unknown as IWhatsAppAccountDocument;
  }

  // Implementing missing Interface methods
  async enqueueMessage(accountId: string, to: string, content: any): Promise<void> {
      // This is the specific method required by contract
      const message = typeof content === 'string' ? content : content.message;
      if (!message) throw new Error('Message content required');
      
      await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, {
            recipient: to,
            message: message,
            accountId: accountId, // Force specific account
            channel: 'WHATSAPP'
      });
  }

  async enqueueBulkMessage(accountId: string, recipients: string[], content: any): Promise<void> {
       const message = typeof content === 'string' ? content : content.message;
       if (!message) throw new Error('Message content required');

       const jobs = recipients.map(to => ({
            name: BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP,
            data: {
                recipient: to,
                message: message,
                accountId: accountId,
                channel: 'WHATSAPP'
            }
       }));
       
       await notificationQueue.queue.addBulk(jobs);
  }

  /**
   * Sync account with active session (Create or Update)
   */
  async syncAccountFromSession(sessionId: string, number: string): Promise<IWhatsAppAccountDocument> {
    const existingAccount = await this.findOne({ sessionId } as any);
    
    if (existingAccount) {
      // Update number if changed and set to ACTIVE if it was DISCONNECTED
      const updateData: any = { number };
      if (existingAccount.status === WHATSAPP_ACCOUNT_STATUS.DISCONNECTED) {
        updateData.status = WHATSAPP_ACCOUNT_STATUS.ACTIVE;
      }
      
      await this.updateOne({ _id: existingAccount._id } as any, { $set: updateData } as any);
      return (await this.findById(existingAccount._id.toString())) as unknown as IWhatsAppAccountDocument;
    } else {
      // Create new account
      return await this.create({
        name: number, // Use number as default name
        externalId: sessionId, // sessionId from argument is the client ID
        number,
        activatedAt: new Date(),
        status: WHATSAPP_ACCOUNT_STATUS.ACTIVE,
        socketStatus: 'CONNECTED' as any, // Will be updated by service events
        isAuthenticated: true,
        isAutoResume: true,
        riskScore: 0,
        sentToday: 0,
        sentThisHour: 0,
        metadata: {
          totalSent: 0,
          totalFailed: 0,
          totalReplies: 0
        }
      }) as any;
    }
  }

  /**
   * Update account status by session ID (e.g., when session disconnects)
   */
  async updateStatusBySessionId(sessionId: string, status: WHATSAPP_ACCOUNT_STATUS): Promise<void> {
    await this.updateOne(
      { sessionId } as any,
      { $set: { status } } as any
    );
  }
}
export const whatsAppAccountService = new WhatsAppAccountService();
