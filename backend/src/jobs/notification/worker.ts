import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IEmailJobPayload, IWhatsAppJobPayload } from '../types';
import { sendEmail } from '../../helpers/sendEmail';
import { WhatsAppAccountService } from '../../services/concrete/whatsAppAccountService';
import { whatsAppContactService } from '../../services/concrete/whatsAppContactService';
import { pushNotificationService } from '../../services/concrete/pushNotificationService';
import { PushNotificationModel } from '../../db/mongodb/models/pushNotificationModel';
import { PUSH_NOTIFICATION_STATUS } from '../../constants/pushNotification';

/**
 * Email Job Processor
 * Handles email notification delivery
 */
const processEmailJob = async (job: Job<IEmailJobPayload>) => {
  const { recipient, subject, body, html, data } = job.data;
  
  console.log(`[Notification Worker] Processing email job ${job.id} for ${recipient}`);

  try {
    const emailHtml = html || data?.html || `<p>${body}</p>`;
    const emailBody = body || data?.body || '';

    await sendEmail({
      to: Array.isArray(recipient) ? recipient : [recipient],
      subject: subject,
      text: emailBody,
      html: emailHtml
    });

    console.log(`[Notification Worker] Email sent successfully to ${recipient}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Notification Worker] Email failed for ${recipient}:`, error);
    throw error;
  }
};

/**
 * WhatsApp Job Processor
 * Handles WhatsApp message delivery with failover support
 */
const processWhatsAppJob = async (job: Job<IWhatsAppJobPayload>) => {
  const { accountId, contactId, recipient, message, templateId } = job.data;
  const whatsAppAccountService = new WhatsAppAccountService();

  console.log(`[Notification Worker] Processing WhatsApp job ${job.id} for ${recipient || contactId}`);

  try {
    let mobile = recipient;

    // Use contactId if recipient is missing
    if (!mobile && contactId) {
      const contact = await whatsAppContactService.findById(contactId);
      if (!contact) {
        throw new Error(`Contact ${contactId} not found`);
      }
      mobile = contact.mobile;
    }

    if (!mobile) {
      throw new Error('Mobile number (recipient or contactId) is required for WhatsApp job');
    }

    // Use account-specific send if accountId provided, otherwise best-effort
    if (accountId) {
      await whatsAppAccountService.sendMessage(accountId, mobile, message);
    } else {
      await whatsAppAccountService.enqueueBestEffortMessage(
        mobile, 
        message, 
        { templateId }
      );
    }

    console.log(`[Notification Worker] WhatsApp message sent/enqueued successfully for ${mobile}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Notification Worker] WhatsApp failed for ${recipient || contactId}:`, error);
    throw error;
  }
};

/**
 * Push Campaign Job Processor
 * Handles sending multicast push notifications and updating campaign stats
 */
const processPushCampaignJob = async (job: Job<{ campaignId: string, tokens: string[], payload: any }>) => {
  const { campaignId, tokens, payload } = job.data;
  
  console.log(`[Notification Worker] Processing push campaign ${campaignId} for ${tokens.length} tokens`);

  try {
    const result: any = await pushNotificationService.sendMulticast(tokens, payload);
    
    // Update campaign with latest stats
    await PushNotificationModel.updateOne(
        { _id: campaignId },
        { 
            $set: { status: PUSH_NOTIFICATION_STATUS.COMPLETED },
            $inc: { 
                'stats.sentCount': result.successCount || tokens.length,
                'stats.failureCount': result.failureCount || 0
            }
        }
    );

    console.log(`[Notification Worker] Push campaign ${campaignId} completed. Success: ${result.successCount}, Failure: ${result.failureCount}`);
    return { success: true, ...result };
  } catch (error: any) {
    console.error(`[Notification Worker] Push campaign ${campaignId} failed:`, error);
    
    await PushNotificationModel.updateOne(
        { _id: campaignId },
        { $set: { status: PUSH_NOTIFICATION_STATUS.FAILED } }
    );
    
    throw error;
  }
};

/**
 * Unified Notification Processor
 * Routes jobs to appropriate handler based on job name
 */
const notificationProcessor = async (job: Job<IEmailJobPayload | IWhatsAppJobPayload>) => {
  console.log(`[Notification Worker] Processing job ${job.id} of type ${job.name}`);

  switch (job.name) {
    case BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL:
      return processEmailJob(job as Job<IEmailJobPayload>);
    
    case BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP:
      return processWhatsAppJob(job as Job<IWhatsAppJobPayload>);
    
    case BULL_QUEUES.NOTIFICATION.JOBS.SEND_PUSH_CAMPAIGN:
      return processPushCampaignJob(job as Job<any>);
    
    default:
      console.error(`[Notification Worker] Unknown job type: ${job.name}`);
      throw new Error(`Unknown notification job type: ${job.name}`);
  }
};

/**
 * Setup Notification Worker
 * Initializes the worker to process notification jobs
 */
export const setupNotificationWorker = () => {
  QueueFactory.createWorker(BULL_QUEUES.NOTIFICATION.NAME, notificationProcessor);
  console.log('[Notification Worker] Notification worker started');
};
